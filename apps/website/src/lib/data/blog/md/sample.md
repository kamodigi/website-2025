---
id: 'sample-technical-article'
title: 'SvelteKitで技術ブログを作った話'
description: 'SvelteKitとマークダウンを使って技術ブログを構築した際の設計と実装について解説します。'
tags:
  - 'SvelteKit'
  - 'TypeScript'
  - 'Markdown'
publishedAt: '2025-01-12'
draft: true
order: 1
---

## はじめに

このブログはSvelteKitとマークダウンを使って構築されています。この記事では、その設計思想と実装方法について解説します。

## なぜSvelteKitを選んだのか

SvelteKitを選択した理由は以下の通りです：

1. **シンプルな構文**: ReactやVueと比べて学習コストが低い
2. **高いパフォーマンス**: コンパイル時に最適化されるため、ランタイムオーバーヘッドが少ない
3. **優れたDX**: ファイルベースルーティング、TypeScriptサポート、HMRなど開発体験が良い

## マークダウンベースのアーキテクチャ

ブログ記事はすべてマークダウンファイルとして管理しています。

### フロントマター

各記事はYAML形式のフロントマターでメタデータを管理：

```yaml
---
id: 'article-slug'
title: '記事タイトル'
description: '記事の説明'
tags:
  - 'Tag1'
  - 'Tag2'
publishedAt: '2025-01-12'
---
```

### マークダウンパース処理

マークダウンのパースには以下のライブラリを使用しています：

- `unified`: マークダウンの処理パイプライン
- `remark-parse`: マークダウンをASTに変換
- `remark-rehype`: マークダウンASTをHTML ASTに変換
- `rehype-stringify`: HTML ASTを文字列に変換
- `remark-frontmatter`: フロントマターの抽出

## 実装のポイント

### 型安全性

TypeScriptで厳密な型定義を行い、型安全性を確保しています：

```typescript
export interface BlogMetadata {
  id: string;
  title: string;
  description: string;
  tags: string[];
  publishedAt: string;
  // ...
}
```

### 動的インポート

Viteの `import.meta.glob` を使って、マークダウンファイルを動的に読み込んでいます：

```typescript
const modules = import.meta.glob('./md/*.md', { as: 'raw', eager: true });
```

## Umami統合による閲覧数表示

Umamiの統計APIを使って、記事ごとの閲覧数を表示する機能を実装予定です。

## まとめ

SvelteKitとマークダウンの組み合わせにより、シンプルで保守性の高い技術ブログシステムを構築できました。

今後は以下の機能を追加予定です：

- Umamiによる閲覧数表示
- 記事検索機能
- タグフィルタリング
- RSS配信

## 参考リンク

- [SvelteKit公式ドキュメント](https://kit.svelte.dev/)
- [unified公式サイト](https://unifiedjs.com/)
