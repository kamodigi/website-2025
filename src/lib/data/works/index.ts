import type { WorkData, WorkFilterOptions, WorkMetadata, WorkSortOption } from '$lib/types/work';
import { locales, type Locale } from '$lib/paraglide/runtime';
import { filterWorks, parseWorkMarkdown, sortWorks } from '$lib/utils/markdown';

// md/{slug}.md が日本語（frontmatter はここ）、md/{slug}.{言語}.md がその言語の本文
const modules = import.meta.glob<string>('./md/*.md', { query: '?raw', import: 'default', eager: true });

type WorkSource = { ja?: string; translations: Partial<Record<Exclude<Locale, 'ja'>, string>> };

/** slug ごとに、日本語のファイルと翻訳の本文をまとめる */
function collectSources(): Map<string, WorkSource> {
  const sources = new Map<string, WorkSource>();
  for (const [path, content] of Object.entries(modules)) {
    const fileName = path.replace(/^.*\/md\//, '').replace(/\.md$/, '');
    const locale = locales.find((l) => l !== 'ja' && fileName.endsWith(`.${l}`)) as Exclude<Locale, 'ja'> | undefined;
    const slug = locale ? fileName.slice(0, -(locale.length + 1)) : fileName;
    const entry = sources.get(slug) ?? { translations: {} };
    if (locale) entry.translations[locale] = content;
    else entry.ja = content;
    sources.set(slug, entry);
  }
  return sources;
}

/**
 * すべてのワークを取得する関数
 * 
 * @param options フィルタリングとソートのオプション
 * @returns ワークデータの配列
 */
export async function getWorks(
  filterOptions?: WorkFilterOptions,
  sortOption?: WorkSortOption
): Promise<WorkData[]> {
  const works = await Promise.all(
    [...collectSources().values()]
      .filter((source): source is typeof source & { ja: string } => source.ja !== undefined)
      .map((source) => parseWorkMarkdown(source.ja, source.translations))
  );
  
  // フィルタリングとソートを適用
  const filteredWorks = filterWorks(works, filterOptions);
  return sortWorks(filteredWorks, sortOption);
}

/**
 * すべてのワークのslugを取得する関数（翻訳の本文のファイルは含めない）
 */
export async function getAllWorkSlugs(): Promise<string[]> {
  return [...collectSources()].filter(([, source]) => source.ja !== undefined).map(([slug]) => slug);
}



/**
 * 特集ワークのみを取得する関数
 * 
 * @param limit 取得する最大数
 * @returns 特集ワークデータの配列
 */
export async function getFeaturedWorks(limit?: number): Promise<WorkData[]> {
  const works = await getWorks({ featuredOnly: true });
  return limit ? works.slice(0, limit) : works;
}

/**
 * スラッグからワークを取得する関数
 * 
 * @param slug ワークのスラッグ（ID）
 * @returns ワークデータ、見つからない場合はnull
 */
export async function getWorkBySlug(slug: string): Promise<WorkData | null> {
  const source = collectSources().get(slug);
  if (!source?.ja) {
    console.error(`Work with slug "${slug}" not found.`);
    return null; // ワークが見つからない場合はnullを返す
  }
  return parseWorkMarkdown(source.ja, source.translations);
}

/**
 * 関連ワークを取得する関数
 * 
 * @param currentWork 現在のワーク
 * @param limit 取得する最大数
 * @returns 関連ワークデータの配列
 */
export async function getRelatedWorks(
  currentWork: WorkMetadata,
  limit = 3
): Promise<WorkData[]> {
  // 同じカテゴリのワークを取得
  const works = await getWorks({
    category: currentWork.category
  });
  
  // 現在のワークを除外
  const filteredWorks = works.filter(
    work => work.metadata.id !== currentWork.id
  );
  
  // 最大数を制限
  return filteredWorks.slice(0, limit);
}