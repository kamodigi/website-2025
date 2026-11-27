# apps/pocketbase

kamodigi.work の制作実績を入れる PocketBase（`https://cms.kamodigi.work`）。[pocketbase-cms](https://github.com/kamodigi/pocketbase-cms) を `/edit/` に置き、編集者はそこで制作実績を書く。
サイト（`apps/website/`）は、制作実績のページを表示するたびに、公開の URL からこの PocketBase を読む。

本番の設定（Coolify・DNS・バックアップ）と運用は [docs/pocketbase-operations.md](../../docs/pocketbase-operations.md) を見る。

## 中身

| パス | 内容 |
| --- | --- |
| `Dockerfile` | 公式の PocketBase（`PB_VERSION`）に、pocketbase-cms（`PBCMS_VERSION`）の CMS とフックを足す |
| `pb_migrations/` | `users.role`、`media`、`works` を作るマイグレーション。起動時に自動で流れる |
| `cms.config.json` | pocketbase-cms の設定。イメージの `/pb/pb_public/edit/config.json` になる（誰でも読めるので秘密を書かない） |
| `compose.yaml`・`dev/` | 手元の開発用（本番のイメージには入らない） |
| `scripts/smoke-test.sh` | イメージを起動して、マイグレーション・フック・CMS を確かめる（CI でも使う） |

pocketbase-cms は、CMS を `ghcr.io/kamodigi/pocketbase-cms:<版>` の `/dist` から、フックを同じ版のリリースの zip の `pb_hooks/` から取る。フックは既定で `pb_public/cms/config.json` を読むので、`/edit/` に置くこのイメージでは `PBCMS_CONFIG_PATH=/pb/pb_public/edit/config.json` を設定している。サイトへの通知のフック（`pbcms_notify.pb.js`）は入れていない。

## 手元で動かす

Docker Compose が必要。

```sh
cd apps/pocketbase
docker compose up -d --build        # 8090 が使われているときは PB_PORT=8091 docker compose up -d --build
```

- PocketBase：<http://localhost:8090>（ダッシュボード <http://localhost:8090/_/> は `admin@example.com` / `password1234`）
- CMS：<http://localhost:8090/edit/>（`editor@example.com` / `password1234`）

アカウントは `dev/pb_migrations/` が作る（開発専用）。データは Docker のボリュームに入り、`docker compose down -v` で消える。マイグレーションや `cms.config.json` を変えたら `docker compose up -d --build` で作り直す。

イメージの確認：

```sh
docker build -t website-2025-pocketbase:local .
scripts/smoke-test.sh website-2025-pocketbase:local   # docker・curl・jq が必要
```

## コレクション

### works（制作実績）

言語ごとの項目は `<基本名>_<言語>` で持つ（pocketbase-cms の多言語の項目）。言語は `cms.config.json` の `locales` と同じ `ja`・`en`・`zh-Hans`・`zh-Hant` で、項目名ではハイフンを小文字とアンダースコアにする（`title_zh_hans`）。必須は基本の言語の `ja` だけ。翻訳がまだの言語は空のままにし、サイトがフォールバックの順で別の言語を出す。

| 項目 | 型 | 内容 |
| --- | --- | --- |
| `slug` | text（必須・一意） | URL の `/works/<slug>`。英小文字・数字・ハイフン |
| `title_{ja,en,zh_hans,zh_hant}` | text（`title_ja` だけ必須） | タイトル |
| `short_description_*` | text | 一覧のカードの短い説明 |
| `description_*` | text | 詳細ページの冒頭と meta description（プレーンテキスト） |
| `body_*` | editor | 本文（HTML）。保存時と API の応答で pocketbase-cms のフックが無害化する。画像は `<img data-media-id="…">` で、`src` は応答のときに media の今のファイルに向く |
| `technologies` | text | 使った技術。カンマ区切り（例：`SvelteKit, TypeScript`） |
| `category` | select | `web`・`mobile`・`desktop`・`other` |
| `work_status` | select（必須） | `completed`・`in-progress`・`archived`（pocketbase-cms の公開状態と紛れないよう `status` にしない） |
| `start_date`・`end_date` | date | 開始日・終了日（進行中なら `end_date` は空） |
| `thumbnail` | relation → media（1件） | サムネイル |
| `gallery` | relation → media（最大50件） | ギャラリー。選んだ順に並ぶ |
| `link_demo`・`link_github`・`link_website` | url | 関連リンク |
| `featured` | bool | トップページに出す |
| `sort_order` | number | 表示順。小さいほど先 |
| `draft` | bool | 下書き |
| `created`・`updated` | autodate | |

API ルール：誰でも読めるのは `draft = false` のレコードだけ。`role = "editor"` の users はすべて読み書きできる。下書きは、CMS の「サイトで確認」が発行するトークンで `GET /api/cms/preview/works/<id>` から読める（`previewUrl` は `https://kamodigi.work/preview`）。

### media（画像）

pocketbase-cms の media プリセットと同じ形に、`file_dark` を足したもの。誰でも読めて、書き込めるのは editor だけ。

| 項目 | 内容 |
| --- | --- |
| `file` | 画像（必須）。サムネイル `160x160f`・`480x0`・`960x0` |
| `file_dark` | 任意。サイトがダークテーマのときに `file` の代わりに出す画像（スクリーンショットのライトとダークの対） |
| `alt` | 代替テキスト（必須） |
| `caption` | キャプション |
| `width`・`height`・`mime` | CMS がアップロードのときに入れる |
| `uploadedBy` | アップロードした users |

本文に挿入した画像は `file` だけを使う（pocketbase-cms のフックが書き換えるのは `file` の URL）。

### users

`role`（select、`editor` だけ）を足す。アカウントは superuser がダッシュボードで作る。サインアップ・自分の削除・自分の `role` の変更はできない。
