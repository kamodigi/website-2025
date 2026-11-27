#!/bin/sh
# PocketBase の公式ビルド (Linux 用 zip) を移転先 https://ganigeorgiev.com/pocketbase/pocketbase から取得し、
# checksums.txt で検証してから DEST_DIR に展開する。apps/pocketbase/Dockerfile が使う（kamodigi/daana-2025 の pocketbase/download-pocketbase.sh と同じもの）。
#
# 使い方: download-pocketbase.sh <version (例: 0.42.3)> <arch (例: amd64)> <展開先ディレクトリ>
#
# 移転先は GitHub Releases と違い、ファイルの URL にリリースのレコード id が入る
# (/api/files/releases/<id>/<file>)。そのため、まず releases コレクションの API でタグから id を引く。
# 引き方は PocketBase 本体の `pocketbase update` (plugins/update) と同じフィルタに揃えている。
# 必要なコマンド: curl, sha256sum, unzip
set -eu

if [ "$#" -ne 3 ]; then
	echo "usage: $0 <version> <arch> <dest_dir>" >&2
	exit 2
fi

version=$1
arch=$2
dest=$3

base_url=https://ganigeorgiev.com
zip_name="pocketbase_${version}_linux_${arch}.zip"
filter="channel.repository.project.name=\"pocketbase\" && channel.repository.name=\"pocketbase\" && channel.name=\"default\" && draft=false && tag=\"v${version}\""

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

curl -fsS --retry 3 -G "${base_url}/api/collections/releases/records" \
	--data-urlencode "filter=${filter}" \
	--data-urlencode "fields=id" \
	--data-urlencode "perPage=1" \
	--data-urlencode "skipTotal=1" \
	-o "$tmp/release.json"

# fields=id で返るのは {"items":[{"id":"..."}],...} だけなので sed で十分 (jq を入れずに済ませる)
record_id=$(sed -n 's/.*"items":\[{"id":"\([a-z0-9]*\)"}.*/\1/p' "$tmp/release.json")
if [ -z "$record_id" ]; then
	echo "PocketBase v${version} のリリースが ${base_url} に見つからない: $(cat "$tmp/release.json")" >&2
	exit 1
fi

files_url="${base_url}/api/files/releases/${record_id}"
curl -fsSL --retry 3 -o "$tmp/checksums.txt" "${files_url}/checksums.txt"
curl -fsSL --retry 3 -o "$tmp/${zip_name}" "${files_url}/${zip_name}"

# checksums.txt の該当行がなければ grep が失敗して止まる
(cd "$tmp" && grep "  ${zip_name}\$" checksums.txt | sha256sum -c -)

mkdir -p "$dest"
unzip -q -o "$tmp/${zip_name}" -d "$dest"
chmod +x "$dest/pocketbase"
