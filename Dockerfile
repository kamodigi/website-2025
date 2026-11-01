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

EXPOSE 3000
CMD [ "pnpm", "start" ]
