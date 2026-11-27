#!/usr/bin/env bash
# PocketBase のイメージを起動し、マイグレーション・フック・CMS が入っていることを確かめる。
# CI（.github/workflows/docker-build.yml）と手元で使う。データは使い捨て（コンテナを消すと消える）。
#
# 使い方: apps/pocketbase/scripts/smoke-test.sh <イメージ>
# 必要なコマンド: docker, curl, jq
set -euo pipefail

image="${1:?usage: $0 <image>}"
port="${SMOKE_PORT:-18090}"
base="http://127.0.0.1:$port"
name="pb-smoke-$$"
# テスト用の使い捨てのアカウント（コンテナと一緒に消える）
email="smoke-editor@example.com"
password="smoke-password-1234"

cleanup() {
	docker rm -f "$name" >/dev/null 2>&1 || true
}
trap cleanup EXIT

fail() {
	echo "::error::$*"
	docker logs "$name" 2>&1 | tail -n 50 || true
	exit 1
}

docker run -d --name "$name" -p "127.0.0.1:$port:8090" "$image" >/dev/null

for _ in $(seq 1 30); do
	curl -fsS "$base/api/health" >/dev/null 2>&1 && break
	sleep 1
done
curl -fsS "$base/api/health" >/dev/null || fail "PocketBase が起動しません"
echo "OK  /api/health"

# CMS と設定ファイルが /edit/ にある
status="$(curl -sS -o /dev/null -w '%{http_code}' "$base/edit/")"
[[ $status == 200 ]] || fail "/edit/ が $status を返しました"
curl -fsS "$base/edit/config.json" | jq -e '.collections.works and .collections.media' >/dev/null ||
	fail "/edit/config.json に works と media がありません"
echo "OK  /edit/ と /edit/config.json"

# superuser を作り、マイグレーションで作ったコレクションと項目を確かめる
docker exec "$name" su-exec pb /pb/pocketbase superuser upsert admin@example.com "$password" >/dev/null
su_token="$(curl -fsS -X POST "$base/api/collections/_superusers/auth-with-password" \
	-H 'Content-Type: application/json' \
	-d "{\"identity\":\"admin@example.com\",\"password\":\"$password\"}" | jq -r .token)"
fields="$(curl -fsS -H "Authorization: $su_token" "$base/api/collections/works" | jq -r '[.fields[].name] | join(" ")')"
for field in slug title_ja title_en title_zh_hans title_zh_hant body_ja gallery thumbnail draft sort_order; do
	[[ " $fields " == *" $field "* ]] || fail "works に $field がありません（$fields）"
done
media_fields="$(curl -fsS -H "Authorization: $su_token" "$base/api/collections/media" | jq -r '[.fields[].name] | join(" ")')"
for field in file file_dark alt window_shaped; do
	[[ " $media_fields " == *" $field "* ]] || fail "media に $field がありません（$media_fields）"
done
echo "OK  コレクション works・media"

# 誰でも works を読める（下書きは出ない）。書き込みはできない
curl -fsS "$base/api/collections/works/records" >/dev/null || fail "works を匿名で読めません"
status="$(curl -sS -o /dev/null -w '%{http_code}' -X POST "$base/api/collections/works/records" \
	-H 'Content-Type: application/json' -d '{"slug":"x","title_ja":"x","work_status":"completed"}')"
[[ $status == 400 || $status == 403 ]] || fail "匿名で works を作れてしまいます（$status）"
echo "OK  works の API ルール（匿名）"

# editor を作り、ログインして pocketbase-cms のフック（/api/cms/schema と保存時の無害化）を確かめる
curl -fsS -X POST "$base/api/collections/users/records" -H "Authorization: $su_token" \
	-H 'Content-Type: application/json' \
	-d "{\"email\":\"$email\",\"password\":\"$password\",\"passwordConfirm\":\"$password\",\"verified\":true,\"role\":\"editor\"}" >/dev/null
token="$(curl -fsS -X POST "$base/api/collections/users/auth-with-password" \
	-H 'Content-Type: application/json' \
	-d "{\"identity\":\"$email\",\"password\":\"$password\"}" | jq -r .token)"

status="$(curl -sS -o /dev/null -w '%{http_code}' "$base/api/cms/schema")"
[[ $status == 401 ]] || fail "/api/cms/schema がトークン無しで $status を返しました（401 のはず）"
curl -fsS -H "Authorization: $token" "$base/api/cms/schema" |
	jq -e '[.collections[].name] == ["works", "media"]' >/dev/null ||
	fail "/api/cms/schema が works と media を返しません（PBCMS_CONFIG_PATH を確かめる）"
echo "OK  /api/cms/schema"

record="$(curl -fsS -X POST "$base/api/collections/works/records" -H "Authorization: $token" \
	-H 'Content-Type: application/json' \
	-d '{"slug":"smoke","title_ja":"確認","work_status":"completed","draft":true,"body_ja":"<p>ok</p><script>alert(1)</script>"}')"
[[ "$(jq -r .body_ja <<<"$record")" != *"<script"* ]] || fail "本文の script が無害化されていません"
id="$(jq -r .id <<<"$record")"
echo "OK  editor が works を作れる・本文の無害化"

# 下書きは匿名には見えない。プレビューのトークンなら読める
status="$(curl -sS -o /dev/null -w '%{http_code}' "$base/api/collections/works/records/$id")"
[[ $status == 404 ]] || fail "下書きが匿名に見えます（$status）"
preview_token="$(curl -fsS -X POST -H "Authorization: $token" "$base/api/cms/preview/works/$id/token" | jq -r .token)"
curl -fsS -H "Authorization: Bearer $preview_token" "$base/api/cms/preview/works/$id" | jq -e '.slug == "smoke"' >/dev/null ||
	fail "プレビューのトークンで下書きを読めません"
echo "OK  下書きの非公開とプレビュー"

# editor は自分の role を変えられない
user_id="$(curl -fsS -H "Authorization: $token" "$base/api/collections/users/auth-refresh" -X POST | jq -r .record.id)"
status="$(curl -sS -o /dev/null -w '%{http_code}' -X PATCH "$base/api/collections/users/records/$user_id" \
	-H "Authorization: $token" -H 'Content-Type: application/json' -d '{"role":""}')"
[[ $status != 200 ]] || fail "editor が自分の role を変えられます"
echo "OK  users の role は本人が変えられない"

echo "すべて OK"
