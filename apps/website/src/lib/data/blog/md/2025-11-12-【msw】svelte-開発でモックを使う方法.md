---
id: "mocking-with-svelte"
title: 【MSW】Svelte 開発でモックを使う方法
description: ""
publishedAt: 2023-12-07T21:59:17.446Z
preview: ""
draft: false
tags:
  - Svelte
  - SvelteKit
---

フロントエンドのテストに`msw`というライブラリを使うのが流行っとるみたいです。便利そうや！とおもい自分の推しフレームワーク`svelte`で使ってみたところ、引っかかった部分があったので記事にしました。`svelte + msw`は便利！

## 引っかかってしまった例

「svelte msw」で検索すると海外の技術ブログがトップで出てきました。

<https://flaming.codes/posts/msw-in-sveltekit-for-local-development>

はじめはこのブログにしたがって実装しました。ざっくりと説明すると、`src/routes/+layout.ts`のscriptタグで開発時のみmswをロードする感じです。

`npm run dev`ではうまく動作したのですが、この状態で`npm run build`するとエラーが発生しました。

```bash
% npm run build

> my-app@0.0.1 build
> vite build


vite v4.4.9 building SSR bundle for production...
✓ 80 modules transformed.
✓ built in 380ms
[commonjs--resolver] No known conditions for "./browser" specifier in "msw" package
error during build:
Error: No known conditions for "./browser" specifier in "msw" package
```

mswは開発時のみ必要なのですが、おそらくビルド時にもロードされてしまっています。develop時のみロードするように書いたつもりなのですが。

＊ひと様の、それも言語が異なる方の記事に文句をつけるようになってしまうのはよくないとわかっていますが、ディスっているわけではなく対応策をシェアするのがこの記事の目的です。

それではイチから始めます。

## svelteのセットアップ

まずsvelteの環境を整えます。この記事ではアプリ名を`my-app`とします。

```bash
npm create svelte@latest my-app
cd my-app
npm install
```

モックできていることを確認するために`src/routes/+page.svelte`を編集してサンプルをつくります。`/login`にpostをすると許可されるというfetchです。

```svelte:+page.svelte
<script lang="ts">
 let isLoggedIn = false;

 function handleLogin() {
  fetch('/login', { method: 'POST' })
   .then((res) => {
    return res.json;
   })
   .then((_data) => {
    isLoggedIn = true;
   });
 }
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

{#if isLoggedIn}
 <p>Logged in. Enjoy!</p>
{:else}
 <p>NOT logged in</p>
 <button on:click={handleLogin}>LOG IN</button>
{/if}

```

＊このコードではログインに失敗してもログインしたかのように表示されます。修正はご自身でやってみてください。

## `vite-plugin-msw`の導入

svelteはビルドツールに`vite`を利用しています。mswをviteで利用するプラグインを開発している方がいらっしゃいました。

<https://github.com/iodigital-com/vite-plugin-msw>

今回はこのプラグインを導入します。このプラグインを導入することで、mswを利用するときに、開発時のみ必要となる`mockServiceWorker.js`ファイルをviteが自動で用意してくれます。このプラグインなしでmswのドキュメントにしたがって自分で`mockServiceWorker.js`を配置しても動くのですが、build時にややこしいことになります。

（[MSWリポジトリのイシュー](https://github.com/mswjs/msw/discussions/712#discussioncomment-4385920)では`vite-plugin-static`というプラグインがオススメされていました。こちらでもいいと思いますよ）。

### プラグインのインストール

```bash
npm install --save-dev @iodigital/vite-plugin-msw
```

パッケージマネージャは適宜読みかえてください。

### モックを定義する

次にモックを定義します。`src/mocks`ディレクトリを作成し、`handlers.ts`を作成します。たとえば「`/login`にpostするとログインが成功する」とすると、こんな感じです。

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
 http.post('/login', () => {
  sessionStorage.setItem('is-authenticated', 'true');

  return HttpResponse.json({ status: 200 });
  }
 )
]
```

このハンドラーを編集・追加することで自由にモックをしてくれます。

### viteに伝える

そして`vite.config.ts`にプラグインを使うように書きます。

```diff ts
+ // プラグインをインポート
+ import msw from "@iodigital/vite-plugin-msw";
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

+ // 先ほど定義したハンドラーをインポート
+ import { handlers } from "./src/mocks/handlers";

+ // プラグインに渡す
export default defineConfig({
 plugins: [
  sveltekit(),
+  msw({ handlers})],
 test: {
  include: ['src/**/*.{test,spec}.{js,ts}']
 }
});

```

`mockServiceWorker.js`をリポジトリに含めておくとビルド時に除外する必要があり面倒やったのでこのプラグインで助かります。

## mswの導入

さて、mswをインストールしsvelteから呼び出すところまでやりましょう。

### `svelte hooks`の作成

Hooksといってもreactのhooksとは違います。svelteのhooksはフレームワークの一部を上書きしたい場合に使います。`src/hooks.client.ts`を作成します。

```ts:hooks.client.ts
import { dev } from '$app/environment';

if (dev) {
 const { worker } = await import('./mocks/browser');

 await worker.start({
  onUnhandledRequest(request, print) {
   // Do not warn on unhandled internal Svelte requests.
   // Those are not meant to be mocked.
   if (request.url.includes('svelte')) {
    return;
   }

   print.warning();
  }
 });
}

```

ほぼ[公式の例](https://github.com/mswjs/examples-new)のまんまです。develop時のみ有効になるように環境変数`dev`を使っています。

ついでにサーバーサイドも書いておきましょう。`src/hooks.server.ts`をつくります。

```ts:hooks.server.ts
import { dev } from '$app/environment';

if (dev) {
 const { server } = await import('./mocks/server');

 server.listen();
}
```

## アプリ起動

`npm run dev`でアプリを起動すると、mswがブラウザで動いているのがコンソールでわかります。

![キャプチャー画像。コンソールでmswが動いていることがわかる](https://storage.googleapis.com/zenn-user-upload/290b8523ba6a-20231207.png)

## 課題が残されている

公式のサンプルのように実装するとうまく行ったのですが、最初に参考にした方法でなぜダメだったのかがわかっていません。

1. ❌ `src/routes/+layout.svelte`で`dev`がTruthy時のみmswをロードする
1. ✅ `src/hooks.client.ts`で`dev`がTruthy時のみmswをロードする

1のバリエーションとして別のコンポーネントに切り出してみたり、`src/routes/+layout.ts`に書いてみたりしたのですが、結局解決しませんでした。

この違いがなんなのか、ご存知の方がいらっしゃればコメントお願いします！

## 参考

<https://github.com/iodigital-com/vite-plugin-msw>
<https://github.com/mswjs/examples-new/tree/main/examples/with-svelte>
<https://kit.svelte.jp/docs/hooks>
<https://github.com/mswjs/msw/discussions/712#discussioncomment-4385920>
