FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true
RUN corepack enable
COPY . /app
WORKDIR /app
# package.json の packageManager フィールドで指定された pnpm を入れる
RUN corepack install

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile --ignore-scripts

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build
# デプロイ後の確認用に /version.json を出す（キャッシュを効かせるため build の後に置く）。GIT_SHA が無いときは unknown。
# adapter-node は build/client/ の中身を静的ファイルとして配る
ARG GIT_SHA=unknown
RUN printf '{"sha":"%s","builtAt":"%s"}\n' "${GIT_SHA:-unknown}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > build/client/version.json

FROM base

# Install curl for health checks
RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 非rootユーザーを作成・使用
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --home /app sveltekit

# /app ディレクトリの所有権を sveltekit ユーザーに変更
RUN chown -R sveltekit:nodejs /app

# ホームディレクトリを明示的に設定
ENV HOME=/app
USER sveltekit

# ビルド成果物と本番用の依存関係のみをコピー
COPY --from=build --chown=sveltekit:nodejs /app/build ./build
COPY --from=build --chown=sveltekit:nodejs /app/package.json ./package.json
COPY --from=build --chown=sveltekit:nodejs /app/node_modules ./node_modules

# adapter-node のサーバー。PORT の既定は 3000。
# 制作実績のページは、実行時の環境変数 POCKETBASE_URL（PocketBase の公開 URL）から読む。
# 未設定や PocketBase に届かないときは、制作実績のページだけが 503 になる（ほかのページはプリレンダー済み）
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD [ "node", "build" ]
