# デザイン確認項目

UI を変更する PR で、デザインの整合性をレビューするときの確認項目。進め方の全体は [AGENTS.md の「UI を変更するときの進め方」](../AGENTS.md#ui-を変更するときの進め方) を参照。

この文書は 2026-11-03 時点のコードを読んで書いている。理想を足すのではなく、今あるものにそろえるための項目である。

## 1. 色・余白・文字サイズは変数だけを使う

値は `src/lib/styles/variables.css` の変数で指定し、`#39bc47` や `12px` のような値を直接書かない。

| 対象 | 使う変数 | 例 |
| --- | --- | --- |
| 色 | `--color-*`（意味ベース） | `--color-background`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-text-secondary`, `--color-text-muted`, `--color-border`, `--color-link`, `--color-link-hover`, `--color-primary-fill` / `--color-on-primary-fill`, `--color-brand`, `--color-focus-ring`, `--color-overlay`, `--color-hover-overlay` |
| 影 | `--shadow-*` | `--shadow-sm`, `--shadow-md`, `--shadow-lg` |
| 影（透明な部分のある画像） | `--drop-shadow-*` | ウィンドウの形に切り抜いたスクリーンショットなど。`box-shadow` や `border` は四角い外形に付いて輪郭が二重になるので、`filter: drop-shadow(var(--drop-shadow-ring)) drop-shadow(var(--drop-shadow-md))` のように使う。`--drop-shadow-ring` は dark だけ見える縁。値は `--drop-shadow-ring` / `-md` / `-lg` |
| テーマで出し分け | `--display-light-only`, `--display-dark-only` | ライト用とダーク用の画像やアイコンを `display` で切り替える |
| 角丸 | `--radius-sm`（0.25rem）, `--radius-md`（0.375rem）, `--radius-lg`（0.5rem）, `--radius-card`, `--radius-full` | タグ・小さい画像は sm、ボタンは md、カード・モーダル・コードブロックは lg |
| 余白 | `--space-*` | `--space-4`（1rem）, `--space-8`（2rem）, `--space-16`（4rem） |
| 文字サイズ | `--text-*` | `--text-xl`, `--text-3xl`, `--text-4xl` |
| 太さ・行間 | `--font-*`, `--leading-*` | `--font-bold`, `--leading-relaxed` |
| アニメーション | `--transition-*`, `--ease-*` | `--transition-fast` |
| 横幅・余白の基準 | `--max-width`, `--container-padding` | `.container` が使っている |

色は、`--color-neutral-white` や `--color-primary` のような**素の色**ではなく、役割を表す**意味ベースの色変数**（上の表）を使う。素の色を直接使うと、ダークモードで色が切り替わらない。ダークの値は `variables.css` の `:root[data-theme='dark']` と `@media (prefers-color-scheme: dark)` の2か所にあり、変数を足すときは両方に書く。文字に使う色は、ライトとダークの両方で背景とのコントラストが WCAG AA（4.5:1）以上になるようにする。

## 2. ライトとダークの両方で確認する

どちらのテーマでも、文字が読めて、境界線や影が見えること。画像（SVG のアイコンなど）が背景に埋もれないこと。ダークモードが未実装の間は、ダークの確認は「対象外」と PR に書く。

## 3. 375px 幅と 1280px 幅で確認する

- どちらの幅でも横スクロールが出ない。
- 既存のブレークポイントに合わせる。`global.css` と各セクションは `max-width: 767px`（モバイル）、`min-width: 768px`（タブレット）、`min-width: 1024px`（デスクトップ）を使っている。新しい値を足さない。
  - 既知の例外: `src/lib/components/ui/Modal.svelte` は `max-width: 640px` を使っている。既存のまま残すが、真似しない。
- コンテンツの幅は `.container`（`--max-width`）に収める。
- 画像のギャラリーやスライダーがある画面では、1 枚ずつ表示されていること（スライドが縮んで横に並んでいない）、サムネイルが折り返しても行頭がそろっていることを見る。

## 4. 言語ごとに、はみ出しと折り返しを見る

サイトにある言語（`project.inlang/settings.json` の `locales`。現在は `ja`, `en`, `zh-Hans`, `zh-Hant`）のすべてで確認する。文言は `messages/<言語>.json` にあり、コンポーネントに直接書かない。翻訳のない文言は、`zh-Hant` → `zh-Hans` → `en` → `ja` の順で代わりに出る（`src/lib/i18n/fallback.js`）。

- 長い単語や URL でレイアウトが崩れない。
- 見出し、ボタン、タグが意図しない位置で折り返さない。
- 言語によって文字数が大きく変わる箇所（ボタン、ナビゲーション）に注意する。

## 5. 既存のセクションと見た目をそろえる

新しいセクションや部品は、既存のものを読んでからそろえる。

- **セクションの外枠**: `.section`（上下 `--space-16`）の中に `.container` を置く。
- **見出し**: `<h2 class="section-title">`。サイズや余白を個別に書き換えない。`.section-subtitle` は補足用。
- **カード**: `src/lib/components/ui/Card.svelte`（`variant`: `default` / `elevated` / `bordered` / `gradient`）や `ThumbnailCard.svelte` を使い、同じものを作り直さない。
- **ボタン**: `src/lib/components/ui/Button.svelte`（`variant`: `primary` / `secondary` / `outline` / `ghost` / `link`、`size`: `sm` / `md` / `lg`）を使う。フォーカス表示は `box-shadow` のリングで、Button に合わせる。
- **リンク**: 色は `--color-link`、ホバーは `--color-link-hover`（`global.css`）。`--color-primary` の明るい緑は白背景で 4.5:1 に届かないので、文字には使わない。
- **本文の補助テキスト**: `--color-text-secondary`、`--leading-relaxed`。

既存の部品で足りないときは、新しい部品を作る前に、なぜ足りないかを PR に書く。

## 6. ドット絵の画像は `image-rendering: pixelated`

ドット絵（`section-brand.svelte` のカモのスプライトなど）は、`image-rendering: pixelated` を指定し、**整数倍**で拡大する（にじみ防止）。スプライトの1コマの大きさと拡大率（`--scale`）を、整数の掛け算で決める。

## 7. `prefers-reduced-motion` に対応する

動くもの（スプライトのアニメーション、`transition`、スクロールで動く演出、WebGL のシェーダー）は、`@media (prefers-reduced-motion: reduce)` で止めるか、動きを減らす。例: `section-brand.svelte` は `animation: none` にしている。

## 8. スクリーンショット

次の組み合わせを撮って PR に貼る。

**{言語} × {light, dark} × {375px, 1280px}**

- 言語は、その時点でサイトにあるすべて（現在は `ja`, `en`, `zh-Hans`, `zh-Hant`）。
- 4 言語 × 2 テーマ × 2 幅 = 16 枚。ダークモードが未実装の間は、light だけでよい。
- 変更した画面（セクション・ページ）だけを撮る。ファイル名や並び順で、組み合わせが分かるようにする。

## 9. レビュー結果の書き方

デザインのレビュアーは、上の項目ごとに「OK / 要修正 / 対象外」を PR のコメントに残す。要修正は、ファイルと箇所を挙げる。
