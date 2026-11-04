# プロジェクトデータの作成方法

このディレクトリには、ポートフォリオサイトに表示するプロジェクトデータが含まれています。
新しいプロジェクトを追加するには、以下の手順に従ってください。

## 1. マークダウンファイルの作成

`src/lib/works/md/` ディレクトリに新しいマークダウンファイルを作成します。
ファイル名はプロジェクトのIDと一致させてください（例: `my-work.md`）。

## 2. フロントマターの設定

マークダウンファイルの先頭に、以下のようなフロントマターを追加します：

```markdown
---
id: 'my-work'
title: 
  ja: 'プロジェクト名'
  en: 'Work Name'
shortDescription:
  ja: '短い説明（日本語）'
  en: 'Short description (English)'
description:
  ja: '詳細な説明（日本語）'
  en: 'Detailed description (English)'
technologies:
  - 'Technology 1'
  - 'Technology 2'
  - 'Technology 3'
category: 'web'  # 'web', 'mobile', 'desktop', 'other'のいずれか
status: 'completed'  # 'completed', 'in-progress', 'archived'のいずれか
startDate: '2025-01-01'  # 開始日（YYYY-MM-DD形式）
endDate: '2025-02-01'  # 終了日（YYYY-MM-DD形式）、進行中の場合は省略可
images:
  thumbnail: '/works/my-work/thumbnail.webp'  # サムネイル画像のパス
  gallery:
    - '/works/my-work/gallery-1.webp'  # ギャラリー画像のパス
    - '/works/my-work/gallery-2.webp'
    - '/works/my-work/gallery-3.webp'
links:
  demo: 'https://example.com/demo'  # デモサイトのURL（省略可）
  github: 'https://github.com/username/my-work'  # GitHubリポジトリのURL（省略可）
  website: 'https://example.com'  # プロジェクトWebサイトのURL（省略可）
featured: false  # 特集プロジェクトとして表示するかどうか
order: 2  # 表示順序（小さいほど先に表示）
---
```

## 3. プロジェクト詳細の記述

フロントマターの後に、マークダウン形式でプロジェクトの詳細を記述します：

```markdown
# プロジェクト名

プロジェクトの概要説明。

## 主な機能

- 機能1
- 機能2
- 機能3

## 開発プロセス

1. 要件定義
2. デザイン
3. 実装
4. テスト
5. デプロイ

## 技術的な詳細

技術的な詳細や実装上の工夫について説明します。

```

## 4. 画像の追加

プロジェクトの画像を `static/works/[work-id]/` ディレクトリに追加します：

- `thumbnail.webp`: サムネイル画像
- `gallery-1.webp`, `gallery-2.webp`, ...: ギャラリー画像

画像は以下の点に注意して最適化してください：

- WebP形式を使用する
- サムネイル画像は 800x600px 程度のサイズ
- ギャラリー画像は 1200x900px 程度のサイズ
- ファイルサイズは1枚あたり200KB以下を目指す
- ライトとダークで画像を変えたいときは、`xxx-light.webp` と `xxx-dark.webp` の2枚を同じ場所に置き、frontmatter には `-light` のほうを書く（サイトのテーマに合わせて自動で出し分けられる。`-dark` が無いと壊れるので、必ず対にする）

## サンプルプロジェクト

参考として、以下のサンプルプロジェクトが用意されています：

- `sample-work.md`: 基本的なプロジェクトの例
- `hodoji-web.md`: 実際のプロジェクトに近い例

これらを参考にして、あなた自身のプロジェクトデータを作成してください。