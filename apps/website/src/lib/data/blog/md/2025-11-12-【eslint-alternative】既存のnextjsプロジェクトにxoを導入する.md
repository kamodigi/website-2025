---
id: "add-xo-to-exinsting-project"
title: 【ESLint alternative】既存のNext.jsプロジェクトにxoを導入する
description: ""
publishedAt: 2022-11-29T17:37:07.463Z
preview: ""
draft: false
tags:
  - Next.js
  - TypeScript
  - ESLint
---

フロントエンド開発をしているとフォーマッターはPrettierとESLintを使うのがスタンダードになっていると思います。Next.jsではESLintをデフォルトのlinterとしていますし。今回は、最近知った`xo`というlinterを導入していこうと思います。

<https://github.com/xojs/xo>

なかなか使うのに苦戦し、結果フォーマッターについての理解も深まったのでみなさんの参考にしていただければと思います！

# xoとは

xoとは多くのデフォルトルールをもったESLintのラッパーです。インストールするだけで簡単に使えるデフォルトlinterを目指しているようです。

# Next.jsに導入する方法

xoを導入する方法は2つあるでしょう。ひとつはESLintにxo configを入れて拡張する方法。もうひとつはESLintを無効にしてxoをインストールする方法です。

Next.jsは（バージョン11以降だったか）ESLintをあらかじめ設定してあります。`yarn lint`をターミナルで実行するだけでプロンプトがあらわれ設定ファイルがつくられます。xoにはeslintで使えるようにルールをまとめた共有ファイルもあるので、ESLintに簡単に追加できそうです。

ただ今回はxoがうたう"It just work!"というのが本当なのかを検証したいため、後者の方法をとります。[xojs/xo: ❤️ JavaScript/TypeScript linter (ESLint wrapper) with great defaults](https://github.com/xojs/xo#config)によると

> Never discuss code style on a pull request again! No decision-making. No .eslintrc to manage. It just works!

本当にコーディングスタイルの論争がなくなれば世界は平和になるでしょうし（？）、フォーマッターのセットアップってなにげに面倒くさいですよね。これが解消されるなら大いに利用していきたいです。

# xoをインストールして実際に使う

## 環境

- M1 MacBook Air 2020
- macOS Ventura 13.0.1
- VS Code

## 準備

なにごとも準備は大事です。今回なかなかに沼ってしまったのですが、原因のひとつはもともとセットアップしていたPrettier, ESLintがxoと競合してしまったことでした。まず、エディタの拡張機能はオフにしておきましょう！VS Codeはワークスペースごとに拡張機能をDisableにすることができるので、Prettier、ESLintをオフにします。

次に、パッケージからもPrettier、ESLintを削除します。

```bash
yarn remove prettier eslint eslint-config-next {その他関係するパッケージ}
```

これでエディタにもパッケージにもフォーマッターがインストールされていない状態になりました。`create-next-app`で生成される`.eslintrc.json`も削除しておきましょう。

## xoをインストール

[公式のInstall](https://github.com/xojs/xo#install)にしたがって進めていきます。

```bash
yarn add -D xo
```

なお、xo公式ではnpmを推奨しているようです。過去のIssuesをみるとyarnで動作不良がおこることもあるようです... Reactで使用するには[xojs/eslint-config-xo-react: ESLint shareable config for React to be used with eslint-config-xo](https://github.com/xojs/eslint-config-xo-react#use-with-xo)というパッケージもインストールする必要があります。

```bash
yarn add -D eslint-config-xo-react eslint-plugin-react eslint-plugin-react-hooks
```

npm scriptとextendsも追加しておきましょう。

```diff json:package.json
{
  ...
  "scripts": {
    "dev": "next dev",
+   "xo": "xo --fix",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "xo": {
+   "extends": ["xo-react"]
    }
  ...
}
```

これで`yarn run xo`あるいはVS Codeで"Run Task" > "npm: xo"と実行することができるようになりました。

## Next.js対応

さらにNext.jsのconfigも入れていきます。

```bash
yarn add -D @next/eslint-plugin-next
```

xoの設定に追加します。

```diff json:package.json
{
  ...
  "xo": {
-   "extends": ["xo-react"]
+   "extends": [
+     "plugin:@next/next/core-web-vitals",
+     "xo-react"
+   ]
    }
  ...
}
```

これでNext.jsのESLintルールが適用されるようになりました。

# おすすめ設定

「xoさえ入れればなにも心配いらないぜ Yeah!」というノリがみえるのですが、どうもNext.jsの都合上「NO Config」とはいきませんでした。

```json:package.json
{
  "xo": {
    "ignores": [
      "next-env.d.ts",
      "next.config.js"
    ],
  }
}
```

`create-next-app`で生成するファイルがxoのポリシーに触れてしまうようです。`next-env.d.ts`は型情報を読みこむファイルですが、"three slash"という普段つかわない`typescript`の文法をつかっており、xoに注意されます。このファイルはいじらない方がいいので`ignores`に追加。config関係のファイルは`ignores`に追加した方がいいですね。

```diff json:package.json
{
  "xo": {
    "rules": {
+     "react/react-in-jsx-scope": "off",
+     "n/prefer-global/process": [
+       "error",
+       "always"
+     ]
    }
  }
}
```

Next.jsは先ほどの`next-env.d.ts`のおかげで`React`をグローバルに使えます。わざわざ`import React from 'react'`と書かなくてもいいということですね。しかしこれもxoには注意されるので、`"react/react-in-jsx-scope"`ルールを追加。

おなじように、`process`はNext.jsのどこでも使えますが、`require(process)`しろ！と怒られるので、`"n/prefer-global/process"`で無効にします。

# 最後に

ESLintのルールはバリエーションが多くて、`xo`のようなものが広まるといいのかもしれません。現状では少し重いかなとか、Prettierとの連携がよくわからないとか不満点はありますが、これからもウォッチしていきたいと思います。

# 参考文献

- [xojs/xo: ❤️ JavaScript/TypeScript linter (ESLint wrapper) with great defaults](https://github.com/xojs/xo#config) Githubリポジトリ
- [Does XO work with Next.js? · Issue #635 · xojs/xo](https://github.com/xojs/xo/issues/635) 主にこの記事を参考にしました
- [xojs/eslint-config-xo-react: ESLint shareable config for React to be used with eslint-config-xo](https://github.com/xojs/eslint-config-xo-react#use-with-xo) `xo`にReactのルールを追加
- [Basic Features: ESLint | Next.js](https://nextjs.org/docs/basic-features/eslint)
- [既存の Next.js プロジェクトに XO を導入](https://zenn.dev/kometan/scraps/308ab8ccc07961) 自分が調べる過程のスクラップです
