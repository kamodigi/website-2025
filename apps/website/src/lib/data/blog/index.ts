import type { BlogData, BlogFilterOptions, BlogMetadata, BlogSortOption } from '$lib/types/blog';
import { filterBlogs, parseBlogMarkdown, sortBlogs } from '$lib/utils/markdown';

/**
 * すべてのブログ記事を取得する関数
 *
 * @param filterOptions フィルタリングオプション
 * @param sortOption ソートオプション
 * @returns ブログ記事データの配列
 */
export async function getBlogs(
  filterOptions?: BlogFilterOptions,
  sortOption?: BlogSortOption
): Promise<BlogData[]> {
  // マークダウンファイルを読み込む
  const modules = import.meta.glob('./md/*.md', { query: '?raw', import: 'default', eager: true });
  const blogs = await Promise.all(Object.entries(modules).map(([, content]) => {
    return parseBlogMarkdown(content as string);
  }));

  // フィルタリングとソートを適用
  const filteredBlogs = filterBlogs(blogs, filterOptions);
  return sortBlogs(filteredBlogs, sortOption);
}

/**
 * すべてのブログ記事のslugを取得する関数
 */
export async function getAllBlogSlugs(): Promise<string[]> {
  const modules = import.meta.glob('./md/*.md', { query: '?raw', import: 'default', eager: true });
  const slugs = Object.keys(modules).map(path => {
    const match = path.match(/\/md\/(.*)\.md$/);
    return match ? match[1] : '';
  }).filter(slug => slug !== '');
  console.log('All blog slugs:', slugs);
  return slugs;
}

/**
 * スラッグからブログ記事を取得する関数
 *
 * @param slug 記事のスラッグ（ID）
 * @returns ブログ記事データ、見つからない場合はnull
 */
export async function getBlogBySlug(slug: string): Promise<BlogData | null> {
  try {
    // すべてのブログを取得してからフィルタリング
    const allBlogs = await getBlogs();
    const blog = allBlogs.find(b => b.metadata.id === slug);
    if (!blog) {
      console.error(`Blog post with slug "${slug}" not found.`);
      return null;
    }
    return blog;
  } catch (e) {
    console.error(`Blog post with slug "${slug}" not found.`, e);
    return null;
  }
}

/**
 * タグからすべてのタグを取得する関数（重複排除）
 *
 * @returns タグの配列
 */
export async function getAllTags(): Promise<string[]> {
  const blogs = await getBlogs({ excludeDrafts: true });
  const tags = new Set<string>();

  blogs.forEach(blog => {
    blog.metadata.tags.forEach(tag => tags.add(tag));
  });

  return Array.from(tags).sort();
}

/**
 * 関連記事を取得する関数
 *
 * @param currentBlog 現在の記事
 * @param limit 取得する最大数
 * @returns 関連記事データの配列
 */
export async function getRelatedBlogs(
  currentBlog: BlogMetadata,
  limit = 3
): Promise<BlogData[]> {
  const allBlogs = await getBlogs({ excludeDrafts: true });

  // 現在の記事を除外
  const otherBlogs = allBlogs.filter(
    blog => blog.metadata.id !== currentBlog.id
  );

  // 共通タグの数でスコアリング
  const scoredBlogs = otherBlogs.map(blog => {
    const commonTags = blog.metadata.tags.filter(tag =>
      currentBlog.tags.includes(tag)
    );
    return {
      blog,
      score: commonTags.length
    };
  });

  // スコアの高い順にソート
  scoredBlogs.sort((a, b) => b.score - a.score);

  // 最大数を制限
  return scoredBlogs.slice(0, limit).map(item => item.blog);
}
