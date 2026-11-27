# 制作実績の PocketBase（cms.kamodigi.work）の運用

kamodigi.work の制作実績は、PocketBase（`https://cms.kamodigi.work`）に入れ、pocketbase-cms（`https://cms.kamodigi.work/edit/`）で編集する。
イメージの中身とコレクションの設計は [apps/pocketbase/README.md](../apps/pocketbase/README.md) を見る。

この文書は、人が Coolify・DNS・バックアップを設定する手順と、その後の運用をまとめる。
**秘密の値（トークン・パスワード・webhook の URL）はここにも PR にも書かない。** 置き場所だけを書く。

## 全体の流れ

```
main への push（apps/pocketbase/ が変わったとき）
  → GitHub Actions（.github/workflows/deploy-pocketbase.yml）
      1. イメージをビルドし、起動して確かめる（apps/pocketbase/scripts/smoke-test.sh）
      2. ghcr.io/kamodigi/website-2025-pocketbase の :<コミットの sha> と :latest に push
      3. Coolify の webhook でデプロイし、終わるまで待つ（.github/scripts/coolify-deploy.sh）
      4. https://cms.kamodigi.work/api/health・/edit/・/edit/config.json が 200 を返すか確かめる
  → Coolify（ConoHa）が :latest を pull して入れ替える。pb_data はボリュームに残る
```

secret の `COOLIFY_TOKEN` と `COOLIFY_WEBHOOK_PB` が無いあいだは、3 と 4 を飛ばす（ジョブは成功し、notice を出す）。Coolify のリソースを作る前にマージしても失敗しない。

## 最初の設定（1回だけ）

### 1. イメージを用意する

1. この PR をマージすると、最初のイメージが `ghcr.io/kamodigi/website-2025-pocketbase` に push される（デプロイは secret が無いので飛ぶ）。
2. GHCR は新しいパッケージを非公開で作る。GitHub の kamodigi の Packages で `website-2025-pocketbase` を開き、**Package settings → Change visibility → Public** にする。
   - イメージに秘密は入っていない（マイグレーション・フック・CMS・`cms.config.json` だけ）。公開にしておくと、Coolify にレジストリの認証を設定せずに済む。
   - 公開にしたくないときは、Coolify にレジストリの認証（`read:packages` だけのトークン）を設定する。

### 2. DNS

`cms.kamodigi.work` を、kamodigi.work と同じ ConoHa のサーバー（Coolify のプロキシ）に向ける。kamodigi.work と同じやり方（同じ種類のレコード、Cloudflare を通すなら同じ設定）にする。

### 3. Coolify のリソース

kamodigi.work と同じプロジェクトに、リソースを1つ作る。

| 項目 | 値 |
| --- | --- |
| 種類 | Docker Image |
| イメージ | `ghcr.io/kamodigi/website-2025-pocketbase`、タグ `latest` |
| ドメイン | `https://cms.kamodigi.work` |
| ポート（Ports Exposes） | `8090` |
| ヘルスチェック | イメージの `HEALTHCHECK`（`/api/health`）を使う |
| 永続ストレージ | **Volume** を1つ。マウント先は `/pb/pb_data`（名前は Coolify の既定のままでよい） |

環境変数：

| 名前 | 値 | 説明 |
| --- | --- | --- |
| `PBCMS_PUBLIC_URL` | `https://cms.kamodigi.work` | 本文の画像の URL の先頭。無いと PocketBase の設定の Application URL を使う |

`PBCMS_CONFIG_PATH` はイメージに入れてあるので設定しない。`PBCMS_NOTIFY_URL` は使わない（サイトは表示のたびに PocketBase を読むので、通知はいらない）。

注意：

- 永続ストレージが無いと、デプロイのたびにデータが消える。**最初のデプロイの前に**ボリュームを設定する。
- ボリュームは bind mount（ホストのディレクトリ）ではなく Docker の volume にする。ConoHa のバックアップ（下の「バックアップ」）は、コンテナが使っている volume を自動で対象にする。
- `entrypoint.sh` が起動のたびに `/pb/pb_data` の持ち主を直してから、root ではないユーザーで PocketBase を動かす。

### 4. 最初のデプロイと superuser

1. Coolify で一度 **Deploy** する。
2. コンテナが起動したら、Coolify のターミナル（またはサーバーで `docker exec`）で superuser を作る。パスワードはパスワードマネージャーで作り、そこに保存する。

   ```sh
   su-exec pb /pb/pocketbase superuser upsert <管理者のメールアドレス> '<パスワード>'
   ```

   （ダッシュボード `https://cms.kamodigi.work/_/` を最初に開いたときに出るインストーラーのリンクから作ってもよい。リンクはコンテナのログに出る）
3. `https://cms.kamodigi.work/_/` に superuser でログインし、**Settings** で次を設定する。
   - **Application name**：`kamodigi.work`
   - **Application URL**：`https://cms.kamodigi.work`
   - **Mail settings**：SMTP（パスワードを忘れたときのメールに使う）。SMTP の認証情報は PocketBase の画面にだけ入れる。
   - **Rate limiting** を有効にする。

### 5. 編集者のアカウント

ダッシュボードの **Collections → users → New record** で作る。

- `email`・`password`（パスワードマネージャーで作る）
- `verified` を on
- `role` を `editor`

`role = "editor"` のアカウントだけが `https://cms.kamodigi.work/edit/` にログインできる。編集者は自分の `role` を変えられず、サインアップもできない（マイグレーションの API ルール）。

### 6. GitHub の secret（デプロイを動かす）

リポジトリの **Settings → Secrets and variables → Actions** に登録する。登録した後の main への push から、Coolify のデプロイと確認まで行う。

| secret | 値 |
| --- | --- |
| `COOLIFY_TOKEN` | Coolify の API トークン（権限は `deploy` と `read`）。kamodigi.work のデプロイと同じものでよい |
| `COOLIFY_WEBHOOK_PB` | このリソースの **Webhooks → Deploy Webhook** の URL（`https://<Coolify>/api/v1/deploy?uuid=...`） |

登録したら、Actions の **Deploy PocketBase** を **Run workflow**（main）で一度動かし、最後まで成功することを確かめる。

### 7. 確かめる

- `https://cms.kamodigi.work/api/health` が 200
- `https://cms.kamodigi.work/edit/` に編集者でログインでき、サイドバーに「制作実績」と「メディア」が出る（上部に設定の警告が出ない）
- 制作実績を下書きで作り、ギャラリーに画像を複数選べる・本文に画像を入れられる・「サイトで確認」が開く（サイト側のプレビューのページができてから）
- 次の日以降、ConoHa のバックアップの対象にこのボリュームが入っている（下の「バックアップ」）

## バックアップ

ConoHa のバックアップ（kamodigi/conoha の `docs/backup.md`）は、毎晩、**コンテナが使っている Docker の volume をすべて**自動で restic に取る。手順 3 で `/pb/pb_data` を volume にしていれば、設定の変更はいらない。

- 対象に入ったかは、kamodigi/conoha の `docs/backup.md` の「2026-11-02 時点の対象」と同じ方法（`backup-agent.sh` の `list`）で確かめ、出てきた volume を同じ表に書き足す。
- 戻すときは、kamodigi/conoha の `docs/backup.md` の「リストア手順」の Step 5（volume のリストア）を、この volume だけに絞って行う。戻す前に Coolify でこのリソースを止める。
- PocketBase（SQLite）は稼働中のファイルをそのまま取っている。整合したバックアップが欲しいとき（PocketBase の版を上げる前など）は、ダッシュボードの **Settings → Backups** でも手動で取っておく（`pb_data/backups/` に入るので、これも restic に入る）。

## 運用

### デプロイ

`apps/pocketbase/`（Dockerfile・マイグレーション・`cms.config.json`）を変えた PR をマージすると、本番に出る。マイグレーションは起動時に自動で流れる。

### ロールバック

Coolify のイメージのタグを、前の `:<コミットの sha>` に変えて再デプロイする。**マイグレーションは戻らない**ので、スキーマを変えた後に戻すときは、バックアップから pb_data も戻す。

### pocketbase-cms と PocketBase の版を上げる

Renovate が PR を作る（`apps/pocketbase/Dockerfile` の `PBCMS_VERSION`・`PB_VERSION`）。

- pocketbase-cms：0.x の間は minor でも互換性が壊れうる。リリースノートを読み、`cms.config.json` とマイグレーションを確かめる。CMS（イメージ）とフック（zip）は同じ版で取るので、`PBCMS_VERSION` だけを変える。
- PocketBase：Dependency Dashboard でチェックしたときだけ PR ができる。変更履歴でシステムマイグレーションを確かめ、マージの前に本番の pb_data のバックアップを取る。

### 編集者を外す

ダッシュボードで、そのアカウントの `role` を空にするか、レコードを消す。次に CMS を開いたときにログアウトし、発行済みのプレビューのトークンもすぐに使えなくなる。
