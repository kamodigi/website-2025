import type { Localized } from '$lib/i18n';

/**
 * Workのメタデータを表すインターフェース
 * マークダウンファイルのfrontmatterから読み込まれる
 */
export interface WorkMetadata {
  /** Workの一意のID（URLスラッグとしても使用） */
  id: string;
  
  /** Workのタイトル（多言語対応） */
  title: Localized;
  
  /** Workの詳細説明（多言語対応） */
  description: Localized;
  
  /** Workの短い説明（カード表示用、多言語対応） */
  shortDescription: Localized;
  
  /** Workで使用された技術のリスト */
  technologies: string[];

  /** Workのカテゴリ */
  category: 'web' | 'mobile' | 'desktop' | 'other';

  /** Workの状態 */
  status: 'completed' | 'in-progress' | 'archived';
  
  /** Workの開始日（YYYY-MM-DD形式） */
  startDate: string;
  
  /** Workの終了日（YYYY-MM-DD形式、進行中の場合は未定義） */
  endDate?: string;
  
  /** Workの画像情報 */
  images: {
    /** サムネイル画像のパス */
    thumbnail: string;
    
    /** ギャラリー画像のパスリスト */
    gallery: string[];
  };
  
  /** Workの関連リンク */
  links: {
    /** デモサイトのURL */
    demo?: string;
    
    /** GitHubリポジトリのURL */
    github?: string;
    
    /** WorkWebサイトのURL */
    website?: string;
  };
  
  /** 特集Workかどうか（ホームページでハイライト表示） */
  featured: boolean;
  
  /** 表示順序（小さいほど先に表示） */
  order: number;
}

/**
 * マークダウンから読み込まれたWorkデータ
 * メタデータとコンテンツを含む
 */
export interface WorkData {
  /** Workのメタデータ */
  metadata: WorkMetadata;
  
  /**
   * Workの詳細コンテンツ（HTMLとして解析されたマークダウン、言語ごと）。
   * ja は md/{id}.md の本文、ほかの言語は md/{id}.{言語}.md の本文
   */
  content: Localized;
}

/**
 * Workフィルタリングオプション
 */
export interface WorkFilterOptions {
  /** カテゴリでフィルタリング */
  category?: 'web' | 'mobile' | 'desktop' | 'other';
  
  /** ステータスでフィルタリング */
  status?: 'completed' | 'in-progress' | 'archived';
  
  /** 特集Workのみを表示 */
  featuredOnly?: boolean;
  
  /** 技術でフィルタリング */
  technology?: string;
}

/**
 * Workソートオプション
 */
export type WorkSortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';
/**
 * 制作実績の画像（PocketBase の media のレコード）。`darkSrc` があれば、ダークのテーマではそちらを出す
 */
export interface WorkImage {
  src: string;
  darkSrc?: string;
  /** 代替テキスト（media.alt） */
  alt: string;
  width?: number;
  height?: number;
  /**
   * ウィンドウの形に切り抜いた画像（角の外側が透明）。角丸・縁・box-shadow を付けず、drop-shadow だけにする
   */
  windowShaped: boolean;
}

/**
 * PocketBase の works コレクションから読んだ制作実績（src/lib/server/works.ts）。
 * 上の WorkData（Markdown から読む形）は、取り込みのスクリプト（kamodigi-m5s.5）が使い終わるまで残す
 */
export interface Work {
  /** URL のスラッグ */
  slug: string;
  title: Localized;
  /** 一覧のカードに出す短い説明（short_description_*） */
  summary: Localized;
  /** 説明（description_*、プレーンテキスト）。meta description に使う */
  description: Localized;
  /** 本文の HTML（PocketBase のフックでサニタイズ済み） */
  body: Localized;
  thumbnail?: WorkImage;
  gallery: WorkImage[];
  links: {
    demo?: string;
    github?: string;
    website?: string;
  };
}
