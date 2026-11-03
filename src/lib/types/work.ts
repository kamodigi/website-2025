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