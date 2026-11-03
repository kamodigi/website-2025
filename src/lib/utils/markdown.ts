import type { WorkData, WorkFilterOptions, WorkMetadata, WorkSortOption } from '$lib/types/work';
import type { Localized } from '$lib/i18n';
import { locales, type Locale } from '$lib/paraglide/runtime';
import type { BlogData, BlogFilterOptions, BlogMetadata, BlogSortOption } from '$lib/types/blog';
import * as yaml from 'js-yaml';
import type { Root, RootContent } from 'mdast';
import rehypeStringify from 'rehype-stringify';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import type { Literal } from 'unist';
import { visit } from 'unist-util-visit';
import type { VFile } from 'vfile';

/**
 * Custom remark plugin to extract and parse frontmatter.
 * Stores the parsed metadata in vfile.data.frontmatter.
 */
function remarkExtractFrontmatter() {
  return (tree: Root, file: VFile) => {
    visit(tree, 'yaml', (node: Literal) => {
      try {
        file.data.frontmatter = yaml.load(node.value as string);
      } catch (e) {
        console.error('Failed to parse frontmatter:', e);
        file.data.frontmatter = {};
      }
      // Remove the yaml node so it's not processed further by remark-rehype
      tree.children = tree.children.filter((child: RootContent) => child !== node);
    });
  };
}

/**
 * マークダウンを frontmatter と本文の HTML に分ける
 */
async function processMarkdown(markdown: string): Promise<{ frontmatter: Record<string, any>; html: string }> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkFrontmatter, ['yaml'])
    .use(remarkExtractFrontmatter)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(markdown);

  return { frontmatter: (file.data.frontmatter || {}) as Record<string, any>, html: String(file) };
}

/**
 * frontmatter の多言語の値を Localized にそろえる。
 * 文字列だけが書かれていたら日本語として扱う。値のない言語は入れない（表示時にフォールバックする）
 */
function toLocalized(value: unknown): Localized {
  if (typeof value === 'string') return { ja: value };
  if (!value || typeof value !== 'object') return { ja: '' };
  const record = value as Record<string, unknown>;
  const result: Localized = { ja: typeof record.ja === 'string' ? record.ja : '' };
  for (const locale of locales) {
    if (locale === 'ja') continue;
    const text = record[locale];
    if (typeof text === 'string' && text !== '') result[locale] = text;
  }
  return result;
}

/**
 * マークダウンファイルからプロジェクトデータを解析する関数
 *
 * @param markdown 日本語のマークダウンファイル（md/{id}.md）の内容。frontmatter はここに書く
 * @param translations ほかの言語の本文（md/{id}.{言語}.md の内容）。frontmatter があっても使わない
 * @returns 解析されたプロジェクトデータ
 */
export async function parseWorkMarkdown(
  markdown: string,
  translations: Partial<Record<Exclude<Locale, 'ja'>, string>> = {}
): Promise<WorkData> {
  const { frontmatter: metadata, html } = await processMarkdown(markdown);

  const content: Localized = { ja: html };
  for (const [locale, translated] of Object.entries(translations) as [Exclude<Locale, 'ja'>, string][]) {
    content[locale] = (await processMarkdown(translated)).html;
  }

  // workMetadataの型に合わせる
  const workMetadata: WorkMetadata = {
    id: metadata.id || '',
    title: toLocalized(metadata.title),
    description: toLocalized(metadata.description),
    shortDescription: toLocalized(metadata.shortDescription),
    technologies: metadata.technologies || [],
    category: metadata.category || 'web',
    status: metadata.status || 'completed',
    startDate: metadata.startDate || '',
    endDate: metadata.endDate,
    images: {
      thumbnail: metadata.images?.thumbnail || '',
      gallery: metadata.images?.gallery || []
    },
    links: {
      demo: metadata.links?.demo,
      github: metadata.links?.github,
      website: metadata.links?.website
    },
    featured: metadata.featured || false,
    order: metadata.order || 0
  };

  return { metadata: workMetadata, content };
}

/**
 * プロジェクトをソートする関数
 * 
 * @param works ソートするプロジェクトの配列
 * @param sortOption ソートオプション
 * @returns ソートされたプロジェクトの配列
 */
export function sortWorks(
  works: WorkData[], 
  sortOption: WorkSortOption = 'newest'
): WorkData[] {
  return [...works].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.metadata.startDate).getTime() - new Date(a.metadata.startDate).getTime();
      case 'oldest':
        return new Date(a.metadata.startDate).getTime() - new Date(b.metadata.startDate).getTime();
      case 'name-asc':
        return a.metadata.title.ja.localeCompare(b.metadata.title.ja);
      case 'name-desc':
        return b.metadata.title.ja.localeCompare(a.metadata.title.ja);
      default:
        return a.metadata.order - b.metadata.order;
    }
  });
}

/**
 * プロジェクトをフィルタリングする関数
 *
 * @param works フィルタリングするプロジェクトの配列
 * @param options フィルタリングオプション
 * @returns フィルタリングされたプロジェクトの配列
 */
export function filterWorks(
  works: WorkData[],
  options?: WorkFilterOptions
): WorkData[] {
  if (!options) return works;

  return works.filter(work => {
    // カテゴリでフィルタリング
    if (options.category && work.metadata.category !== options.category) {
      return false;
    }

    // ステータスでフィルタリング
    if (options.status && work.metadata.status !== options.status) {
      return false;
    }

    // 特集プロジェクトのみを表示
    if (options.featuredOnly && !work.metadata.featured) {
      return false;
    }

    // 技術でフィルタリング
    if (options.technology && !work.metadata.technologies.includes(options.technology)) {
      return false;
    }

    return true;
  });
}

/**
 * マークダウンファイルからブログ記事データを解析する関数
 *
 * @param markdown マークダウンファイルの内容
 * @returns 解析されたブログ記事データ
 */
export async function parseBlogMarkdown(markdown: string): Promise<BlogData> {
  const { frontmatter: metadata, html: content } = await processMarkdown(markdown);

  // blogMetadataの型に合わせる
  const blogMetadata: BlogMetadata = {
    id: metadata.id || '',
    title: metadata.title || '',
    description: metadata.description || '',
    tags: metadata.tags || [],
    publishedAt: metadata.publishedAt || '',
    updatedAt: metadata.updatedAt,
    thumbnail: metadata.thumbnail,
    draft: metadata.draft === true, // デフォルトはfalse（公開状態）
    order: metadata.order
  };

  return { metadata: blogMetadata, content };
}

/**
 * ブログ記事をソートする関数
 *
 * @param blogs ソートするブログ記事の配列
 * @param sortOption ソートオプション
 * @returns ソートされたブログ記事の配列
 */
export function sortBlogs(
  blogs: BlogData[],
  sortOption: BlogSortOption = 'newest'
): BlogData[] {
  return [...blogs].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
      case 'oldest':
        return new Date(a.metadata.publishedAt).getTime() - new Date(b.metadata.publishedAt).getTime();
      case 'title-asc':
        return a.metadata.title.localeCompare(b.metadata.title);
      case 'title-desc':
        return b.metadata.title.localeCompare(a.metadata.title);
      case 'order':
        // orderが指定されている場合はそれを使用、なければ公開日順
        if (a.metadata.order !== undefined && b.metadata.order !== undefined) {
          return a.metadata.order - b.metadata.order;
        }
        return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
      default:
        return new Date(b.metadata.publishedAt).getTime() - new Date(a.metadata.publishedAt).getTime();
    }
  });
}

/**
 * ブログ記事をフィルタリングする関数
 *
 * @param blogs フィルタリングするブログ記事の配列
 * @param options フィルタリングオプション
 * @returns フィルタリングされたブログ記事の配列
 */
export function filterBlogs(
  blogs: BlogData[],
  options?: BlogFilterOptions
): BlogData[] {
  if (!options) return blogs;

  return blogs.filter(blog => {
    // 下書きを除外
    if (options.excludeDrafts && blog.metadata.draft) {
      return false;
    }

    // タグでフィルタリング
    if (options.tag && !blog.metadata.tags.includes(options.tag)) {
      return false;
    }

    return true;
  });
}