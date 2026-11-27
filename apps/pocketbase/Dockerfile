# kamodigi.work の制作実績を入れる PocketBase（cms.kamodigi.work）。pocketbase-cms を /edit/ に置く。
# ビルドのコンテキストは apps/pocketbase/。main への push で .github/workflows/deploy-pocketbase.yml が
# ghcr.io/kamodigi/website-2025-pocketbase に push し、Coolify がそのイメージを pull する。

# pocketbase-cms の版。CMS（イメージの /dist）とフック（同じ版のリリースの zip の pb_hooks/）を必ず同じ版にそろえる。
# 0.x の間は minor でも互換性が壊れうるので、上げるときはリリースノートを読み、cms.config.json とマイグレーションを確かめる。
# renovate: datasource=docker depName=ghcr.io/kamodigi/pocketbase-cms
ARG PBCMS_VERSION=0.2.0

FROM ghcr.io/kamodigi/pocketbase-cms:${PBCMS_VERSION} AS pbcms

FROM alpine:3.24 AS downloader

# PocketBase の配布元は v0.41.0 から https://ganigeorgiev.com/pocketbase/pocketbase に移った。
# 取得と checksum の検証は download-pocketbase.sh で行う。版を上げるときは変更履歴で互換性が壊れる変更と
# システムマイグレーションを確かめ、本番の pb_data をバックアップしてからマージする（main へのマージで本番に出る）。
# renovate: datasource=go depName=ganigeorgiev.com/pocketbase/pocketbase
ARG PB_VERSION=0.42.3
ARG TARGETARCH=amd64
ARG PBCMS_VERSION

COPY download-pocketbase.sh /usr/local/bin/download-pocketbase.sh
RUN apk add --no-cache ca-certificates curl unzip \
	&& download-pocketbase.sh "${PB_VERSION}" "${TARGETARCH}" /pb

# フックはイメージに入っていないので、同じ版のリリースの zip から pb_hooks/ だけを取り出す。
# サイトへの通知（pbcms_notify.pb.js）は使わない（PBCMS_NOTIFY_URL を設定しない）ので入れない。
RUN curl -fsSL --retry 3 -o /tmp/pbcms.zip \
		"https://github.com/kamodigi/pocketbase-cms/releases/download/v${PBCMS_VERSION}/pocketbase-cms_${PBCMS_VERSION}.zip" \
	&& unzip -q /tmp/pbcms.zip 'pb_hooks/*' -d /tmp/pbcms \
	&& rm -f /tmp/pbcms/pb_hooks/pbcms_notify.pb.js \
	&& test -f /tmp/pbcms/pb_hooks/pbcms_schema.pb.js \
	&& mkdir -p /pb/pb_hooks \
	&& cp -R /tmp/pbcms/pb_hooks/. /pb/pb_hooks/

FROM alpine:3.24

RUN apk add --no-cache ca-certificates su-exec tzdata wget \
	&& addgroup -S pb && adduser -S pb -G pb

WORKDIR /pb
COPY --from=downloader /pb/pocketbase /pb/pocketbase
COPY --from=downloader /pb/pb_hooks /pb/pb_hooks
COPY pb_migrations /pb/pb_migrations
# CMS は https://cms.kamodigi.work/edit/ で開く。設定ファイルは CMS と同じフォルダの config.json
COPY --from=pbcms /dist /pb/pb_public/edit
COPY cms.config.json /pb/pb_public/edit/config.json
COPY entrypoint.sh /entrypoint.sh

# フックと Go パッケージは既定で pb_public/cms/config.json を読むので、/edit/ に置くときは必ず指定する
ENV PBCMS_CONFIG_PATH=/pb/pb_public/edit/config.json

RUN mkdir -p pb_data && chown -R pb:pb /pb \
	&& chmod +x /entrypoint.sh

EXPOSE 8090

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
	CMD wget -qO- http://127.0.0.1:8090/api/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["serve", "--http=0.0.0.0:8090"]
