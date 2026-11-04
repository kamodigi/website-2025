# プロジェクトデータの作成方法

このディレクトリには、ポートフォリオサイトに表示するプロジェクトデータが含まれています。
新しいプロジェクトを追加するには、以下の手順に従ってください。

## 1. マークダウンファイルの作成

`src/lib/data/works/md/` ディレクトリに新しいマークダウンファイルを作成します。
ファイル名はプロジェクトのIDと一致させてください（例: `my-work.md`）。

## 2. フロントマターの設定

マークダウンファイルの先頭に、以下のようなフロントマターを追加します：

```markdown
---
id: 'my-work'
title:
  ja: 'プロジェクト名'
  en: 'Work Name'          # 翻訳がまだなら行ごと書かない（下を参照）
  zh-Hans: '项目名称'
  zh-Hant: '專案名稱'
shortDescription:
  ja: '短い説明（日本語）'  # 日本語だけのときは ja だけを書く
description:
  ja: '詳細な説明（日本語）'
technologies:
  - 'Technology 1'
  - 'Technology 2'
  - 'Technology 3'
category: 'web'  # 'web', 'mobile', 'desktop', 'other'のいずれか
status: 'completed'  # 'completed', 'in-progress', 'archived'のいずれか
startDate: '2025-01-01'  # 開始日（YYYY-MM-DD形式）
endDate: '2025-02-01'  # 終了日（YYYY-MM-DD形式）、進行中の場合は省略可
images:
  thumbnail: 'my-work/thumbnail.webp'  # static/works/ からのパス（先頭に / や works/ を付けない）
  gallery:
    - 'my-work/gallery-1.webp'  # ギャラリー画像のパス（同上）
    - 'my-work/gallery-2.webp'
    - 'my-work/gallery-3.webp'
links:
  demo: 'https://example.com/demo'  # デモサイトのURL（省略可）
  github: 'https://github.com/username/my-work'  # GitHubリポジトリのURL（省略可）
  website: 'https://example.com'  # プロジェクトWebサイトのURL（省略可）
featured: false  # 特集プロジェクトとして表示するかどうか
order: 2  # 表示順序（小さいほど先に表示）
---
```

### 多言語の項目（`title`、`shortDescription`、`description`）

- 言語のキーは `ja`, `en`, `zh-Hans`, `zh-Hant`（`project.inlang/settings.json` の `locales` と同じ。大文字小文字も同じ）。
- `ja` は必須。ほかの言語は省略できる。
- **翻訳がまだの言語は、キーごと書かない。** `en: '（日本語の文をそのまま）'` のように日本語を写すと、
  英語のページでその文が「英語」として扱われ（`lang="en"` が付く）、翻訳の漏れとしても見つけにくくなる。
- 省略した言語のページでは、`zh-Hant` → `zh-Hans` → `en` → `ja` の順で、書いてある言語の文が出る
  （順番は `src/lib/i18n/fallback.js`）。
- 値に文字列だけを書いた場合（`title: 'ori'`）は、日本語として扱う。

### 表示する側（コンポーネント）

`title[lang]` のように直接引かず、`$lib/i18n` の `pickLocalized` を通す。実際に出した言語が返るので、`lang` 属性に付ける。

```svelte
<script lang="ts">
  import { pickLocalized } from '$lib/i18n';
  import { getLocale } from '$lib/paraglide/runtime';
  const lang = getLocale();
</script>

{@const title = pickLocalized(work.metadata.title, lang)}
<h2 lang={title.locale}>{title.value}</h2>

<!-- 本文も言語ごと（work.content は Localized） -->
{@const content = pickLocalized(work.content, lang)}
<div lang={content.locale}>{@html content.value}</div>
```

値だけでよいとき（`alt` など）は `localized(work.metadata.title, lang)` を使う。

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

### 本文の翻訳

本文の翻訳は、同じディレクトリに `{id}.{言語}.md` として置く（例: `my-work.en.md`、`my-work.zh-Hans.md`）。
本文だけを書き、フロントマターは書かない（書いても使わない）。ファイルのない言語のページでは、
フロントマターと同じフォールバックの順で本文が出る。

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

- `hodoji-web.md`: 画像（サムネイルとギャラリー）がある例
- `portfolio.md`: 画像がない例

これらを参考にして、あなた自身のプロジェクトデータを作成してください。