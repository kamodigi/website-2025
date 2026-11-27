#!/usr/bin/env bash
# Coolify の webhook でデプロイを始め、終わるまで待つ。finished 以外で終わったら失敗する。
# kamodigi/daana-2025 の scripts/coolify-deploy.sh と同じもの（直すときは両方を直す）。
# .github/workflows/deploy-pocketbase.yml が使う。
# webhook はデプロイを受け付けた時点で応答するため、その応答だけでは成否が分からない。
#
# 環境変数:
#   COOLIFY_WEBHOOK_URL  必須。Coolify の deploy webhook (https://<host>/api/v1/deploy?uuid=...)
#   COOLIFY_TOKEN        必須。Coolify の API トークン (権限は deploy と read)
#   COOLIFY_TIMEOUT      任意。完了を待つ秒数 (既定 600)
#   COOLIFY_INTERVAL     任意。状態を問い合わせる間隔の秒数 (既定 10)
#
# API: https://coolify.io/docs/api-reference/api/operations/deploy-by-tag-or-uuid
#      https://coolify.io/docs/api-reference/api/operations/get-deployment-by-uuid
# URL は secret の一部なのでログに出さない。
set -euo pipefail

: "${COOLIFY_WEBHOOK_URL:?COOLIFY_WEBHOOK_URL が未設定です}"
: "${COOLIFY_TOKEN:?COOLIFY_TOKEN が未設定です}"
timeout="${COOLIFY_TIMEOUT:-600}"
interval="${COOLIFY_INTERVAL:-10}"

fail() {
	echo "::error::$*"
	exit 1
}

# 状態の問い合わせ先は webhook と同じ Coolify の API
api_base="${COOLIFY_WEBHOOK_URL%%/deploy\?*}"
[[ $api_base == */api/v1 ]] || fail "COOLIFY_WEBHOOK_URL が .../api/v1/deploy?... の形ではありません"

body="$(mktemp)"
trap 'rm -f "$body"' EXIT

# 応答の本文を $body に書き、HTTP のステータスを出力する (接続できないときは 000)
request() {
	: >"$body"
	curl -sSL --max-time 30 -o "$body" -w '%{http_code}' \
		-H "Authorization: Bearer $COOLIFY_TOKEN" -H 'Accept: application/json' "$@" || true
}

code="$(request -X POST "$COOLIFY_WEBHOOK_URL")"
[[ $code == 2?? ]] || fail "Coolify の webhook が失敗しました (HTTP $code): $(head -c 500 "$body")"
cat "$body"
echo

# 同じコミット (Docker イメージのリソースでは常に HEAD) のデプロイが残っていると、Coolify は新しく始めずに
# 既存のデプロイを返す。そのデプロイは今 push したイメージより前に pull しているかもしれない
if jq -e 'any(.deployments[]?; .message == "Deployment already queued for this commit.")' "$body" >/dev/null 2>&1; then
	fail "別のデプロイが実行中のため、新しいデプロイは始まりませんでした。終わってからこのジョブを再実行してください"
fi

# 対象の中に deployment_uuid が無いもの (権限が無い、Service など) があれば結果を確かめられないので失敗にする
uuids="$(jq -er '.deployments | select(length > 0 and all(.[]; .deployment_uuid)) | .[].deployment_uuid' "$body" 2>/dev/null)" ||
	fail "webhook の応答から deployment_uuid を取得できません。デプロイが始まっていない可能性があります"

SECONDS=0
for uuid in $uuids; do
	last=""
	while true; do
		code="$(request "$api_base/deployments/$uuid")"
		case "$code" in
		200) status="$(jq -r '.status // empty' "$body" 2>/dev/null || true)" ;;
		401 | 403) fail "デプロイの状態を読めません (HTTP $code)。COOLIFY_TOKEN に read の権限があるか確認してください" ;;
		# 一時的な失敗は、時間切れまで問い合わせ直す
		*) status="" ;;
		esac
		current="${status:-取得できず (HTTP $code)}"
		if [[ $current != "$last" ]]; then
			echo "deployment $uuid: $current (${SECONDS}s)"
			last="$current"
		fi
		case "$status" in
		finished) break ;;
		failed | cancelled-by-user | skipped)
			fail "Coolify のデプロイが $status で終わりました (deployment $uuid)。Coolify のデプロイログを確認してください"
			;;
		esac
		((SECONDS < timeout)) ||
			fail "${timeout} 秒待ってもデプロイが終わりません (deployment $uuid、最後の状態: $current)。Coolify を確認してください"
		sleep "$interval"
	done
done
