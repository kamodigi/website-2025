---
id: "migrate-yarn-from-global-to-project-based"
title: Yarnをグローバルからproto管理に移行【Nix home-manager】
description: ""
publishedAt: 2025-04-16T15:00:23.270Z
preview: ""
draft: false
tags:
  - Yarn
  - Proto
---

最近nixや[proto](https://moonrepo.dev/proto)をさわったりhomebrewについて再考したり開発環境を見直している。そんな中あるプロジェクトで使っているyarnが気になった。あれ、このyarn、どこで管理してるっけ？

```bash
$ which yarn
<user-home>/.yarn/bin/yarn
```

そういえばberryにアップグレードする時にグローバルインストールした気がする。これはいけない！

## 環境

- macOS 15.3.2
- MacBook Air M1

## 環境管理ツール proto

<https://moonrepo.dev/proto>

プロジェクトごとに環境構築するために色々なツールがある。これまでNodeのバージョン管理のためにnodenvやvoltaなど使ったことがあるが、protoはnodeに限らず、bun, denoといったオールインワン・パッケージマネージャとか、go, rust, pyhon, ruby などさまざまなツールに対応しているのが特徴だ。

現在ぼくのnode管理ははるか昔に`anyenv, nodenv`で構築したもの。というか`anyenv`の存在を最近まで忘れていたものだ。当初はわかりやすいし、ツールを使いこなしてるのイケてるぅと思っていた。でも2段階かけて環境構築していたのは複雑でめんどくさいと感じるようになり、忘れやすいというデメリットもわかった。ぼくのフロントエンド環境は「このnodeどこで入れたっけ？」「yarnはグローバル、pnpmはhomebrew、bunは、、、わからん！」と混乱を極めている。なんとか整理したい。

## Nix + proto 使い分け

最近nixで宣言的な環境構築をたのしんでいる。この混乱を極めた開発環境をNix Home Managerで整頓することにした。

- Nix home managerでprotoをインストール
  - グローバルで使うコマンド(proto)はhome managerで管理する
- プロジェクトごとのツールは各ディレクトリでprotoをつかって構築
  - ex. `some/where/project/`ではNode: 22.x, pnpm: 10.8 など

ちなみに、なぜプロジェクトごとのツール管理をnix direnvを使わないのかというと、正直完全にイミュータブルな環境にするのが不安だからというだけ。いま現在では「全部nixファイルで完結するよ〜」という言葉が魅力的ながら、裏を返すと「nix以外でのアップデートできないし設定変更できないぞ」という点が懸念。 nixに慣れてくれば全部nixに移行するかもしれないが、とりあえずプロジェクトごとのツールはprotoを使うことにする。

## Nix Home Managerでprotoをインストール

nix home managerのインストール方法は、いくつかの記事を参考にしました。

<https://zenn.dev/kawarimidoll/articles/9c44ce8b60726f>

<https://qiita.com/kino-ma/items/e56da50fcb1d31bfc820>

Protoをインストールするには`pkgs.proto`を追加するだけ。

```diff nix:~/.config/home-manager/home.nix
home.packages = [
    ...
+    pkgs.proto
  ];
```

保存して`home-manager switch`を実行して新しいターミナルをひらくと、あら不思議`$ proto`が利用できる。

## 古いyarnを掃除する

ぼくのPATHを確認すると"\$HOME/.yarn/bin" "\$HOME/.config/yarn/global/node_modules/.bin"という2つがある。

```bash
rm -rf $HOME/.config/yarn
rm -rf $HOME/.yarn
```

ほかに見落としがあるかもしれませんが、コマンドとしては`yarn`は使えなくなった。

こういう「見落としがあるかも」というのを排除できるのがnixファイルでの管理の素朴なメリットだなあ。

## protoでyarnをインストール

ではプロジェクト`some/where/project/`で`yarn`をインストール。

![proto plugin yarn](https://storage.googleapis.com/zenn-user-upload/74c91587b2c7-20250415.png)

まずこれまで使用していたyarnのバージョンに固定。

```bash:some/where/project/
$ proto pin yarn 4.6

│ SUCCESS
│ Pinned yarn version ~4.6 to config some/where/project/.prototools

✨ There's a new version of proto available, 0.47.11 (currently on 0.47.9)
✨ Run proto upgrade or install from https://moonrepo.dev/docs/proto/install

$ proto install yarn 4.6

│ SUCCESS
│ yarn 4.6.0 has been installed to <user-home>/.proto/tools/yarn/4.6.0!

```

以上でインストールできました。`which yarn`の結果は`<user-home>/.proto/shims/yarn`となり`yarn run dev`などのコマンドも動作しました。protoのバージョンについて注意されてますがnixpkgsのアップデート待ちです。

## 最近nixに入門しました

<https://zenn.dev/kometan/scraps/1893c36c0e4404>

<https://zenn.dev/kometan/scraps/66f3a6206941b1>

これからも更新していく予定です。
