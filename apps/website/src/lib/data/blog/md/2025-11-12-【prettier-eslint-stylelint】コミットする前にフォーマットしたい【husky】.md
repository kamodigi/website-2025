---
id: "format-before-commit"
title: 【Prettier, ESLint, Stylelint】コミットする前にフォーマットしたい【husky】
description: ""
publishedAt: 2023-03-20T19:37:35.895Z
preview: ""
draft: false
tags: []
---
しばらく作業に没頭してからふとコミットすると、フォーマットを忘れてしまっていることがあります。これ自動化したいなと思っていたので調査しました。

`husky`と`lint-staged`というライブラリを使います。なお、この記事では`prettier, eslint, styleling`の設定は扱いません。

## `husky`のセットアップ

<https://typicode.github.io/husky/#/?id=automatic-recommended>

今回は`pnpm`を使っていますが、公式に`npm`や`yarn`の場合ものっています。

```bash
pnpm dlx husky-init && pnpm install
```

するとルートディレクトリに`.husky`ディレクトリが作成され、`husky`が`package.json`が追加されインストールされます。デフォルトでは`.husky/pre-commit`というファイルに`npm test`のみ書かれた簡単なサンプルが作られます。コミット直前に自動で実行したいコマンドはここに書いていくようです。

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm test
```

たとえば「コミット直前に`prettier`を走らせる」なら`npm test`の部分を`prettier --write .`など動かしたいコマンドに書き換えます。わたしはlintのスクリプトを書いているので`pnpm run lint`としました。

## `lint-staged`のセットアップ

<https://github.com/okonet/lint-staged#-lint-staged--->

`husky`のおかげで「あ、忘れてた…」がなくなったのですが、ちょっとした変更しかないのにコミットするたびに全てをlintするのは避けたいですよね。そのために`lint-staged`を使用します。公式の[Installation and Setup](https://github.com/okonet/lint-staged#installation-and-setup)にそって進めます。

```bash
pnpm install -D lint-staged
```

そしてコミット直前に実行するために`husky`に登録します。さきほどの`.husky/pre-commit`ファイルを書き換え、

```diff
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

- npm test
+ pnpm exec lint-staged
```

これで`lint-staged`がフックされます。

`prettier, eslint`などはすでにセットアップされているものとして、`lint-staged`の設定ファイルをつくります。

```js:.lintstagedrc.cjs
module.exports = {
 '*': 'pnpm run lint',
}
```

拡張子別にコマンドを指定することができますが、今回はおなじコマンドにします。

## 参考

<https://techlab.q-co.jp/articles/53/>
