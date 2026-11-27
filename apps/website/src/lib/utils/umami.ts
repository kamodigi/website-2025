import type { UmamiPageStats } from '$lib/types/blog';
import { PUBLIC_UMAMI_WEBSITE_ID, PUBLIC_UMAMI_API_URL } from '$env/static/public';

/**
 * Umami APIから特定のページの統計情報を取得する
 *
 * @param path ページのパス（例: '/blog/article-slug'）
 * @param startDate 集計開始日（YYYY-MM-DD形式、オプション）
 * @param endDate 集計終了日（YYYY-MM-DD形式、オプション）
 * @returns ページビュー統計
 */
export async function getPageStats(
  path: string,
  startDate?: string,
  endDate?: string
): Promise<UmamiPageStats | null> {
  try {
    // 環境変数が設定されていない場合はnullを返す
    if (!PUBLIC_UMAMI_API_URL || !PUBLIC_UMAMI_WEBSITE_ID) {
      console.warn('Umami configuration not found. Please set PUBLIC_UMAMI_API_URL and PUBLIC_UMAMI_WEBSITE_ID in .env');
      return null;
    }

    // デフォルトで過去30日間の統計を取得
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const start = startDate || thirtyDaysAgo.toISOString().split('T')[0];
    const end = endDate || now.toISOString().split('T')[0];

    // Umami API v2のエンドポイント
    const url = new URL(`${PUBLIC_UMAMI_API_URL}/api/websites/${PUBLIC_UMAMI_WEBSITE_ID}/stats`);
    url.searchParams.append('startAt', new Date(start).getTime().toString());
    url.searchParams.append('endAt', new Date(end).getTime().toString());
    url.searchParams.append('url', path);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`Umami API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    return {
      pageviews: data.pageviews?.value || 0,
      visitors: data.visitors?.value || 0
    };
  } catch (error) {
    console.error('Failed to fetch Umami stats:', error);
    return null;
  }
}

/**
 * 複数のページの統計情報を一括取得する
 *
 * @param paths ページパスの配列
 * @returns パスをキーとした統計情報のマップ
 */
export async function getBatchPageStats(
  paths: string[]
): Promise<Map<string, UmamiPageStats>> {
  const statsMap = new Map<string, UmamiPageStats>();

  // 並列でリクエストを送信
  const results = await Promise.allSettled(
    paths.map(path => getPageStats(path))
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      statsMap.set(paths[index], result.value);
    }
  });

  return statsMap;
}

/**
 * Umamiトラッキングスクリプトを返す（クライアントサイドで使用）
 *
 * @returns Umamiスクリプトタグの文字列
 */
export function getUmamiScript(): string {
  if (!PUBLIC_UMAMI_API_URL || !PUBLIC_UMAMI_WEBSITE_ID) {
    return '';
  }

  return `<script async src="${PUBLIC_UMAMI_API_URL}/script.js" data-website-id="${PUBLIC_UMAMI_WEBSITE_ID}"></script>`;
}
