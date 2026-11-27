/**
 * ブログ記事のメタデータを表すインターフェース
 * マークダウンファイルのfrontmatterから読み込まれる
 */
export interface BlogMetadata {
  /** 記事の一意のID（URLスラッグとしても使用） */
  id: string;

  /** 記事のタイトル */
  title: string;

  /** 記事の説明 */
  description: string;

  /** 記事で扱う技術・トピックのタグ */
  tags: string[];

  /** 記事の公開日（YYYY-MM-DD形式） */
  publishedAt: string;

  /** 記事の最終更新日（YYYY-MM-DD形式） */
  updatedAt?: string;

  /** サムネイル画像のパス */
  thumbnail?: string;

  /** 記事が下書き状態かどうか */
  draft: boolean;

  /** 表示順序（小さいほど先に表示、未指定の場合は公開日順） */
  order?: number;
}

/**
 * マークダウンから読み込まれたブログ記事データ
 * メタデータとコンテンツを含む
 */
export interface BlogData {
  /** 記事のメタデータ */
  metadata: BlogMetadata;

  /** 記事の詳細コンテンツ（HTMLとして解析されたマークダウン） */
  content: string;
}

/**
 * ブログ記事フィルタリングオプション
 */
export interface BlogFilterOptions {
  /** タグでフィルタリング */
  tag?: string;

  /** 下書きを除外して表示 */
  excludeDrafts?: boolean;
}

/**
 * ブログ記事ソートオプション
 */
export type BlogSortOption = 'newest' | 'oldest' | 'title-asc' | 'title-desc' | 'order';

/**
 * Umami API統合用の型定義
 */
export interface UmamiPageStats {
  /** ページビュー数 */
  pageviews: number;

  /** ユニーク訪問者数 */
  visitors?: number;
}
