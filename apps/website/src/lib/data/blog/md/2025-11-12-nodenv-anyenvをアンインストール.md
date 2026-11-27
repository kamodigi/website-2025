---
id: "uninstall-nodenv-anyenv"
title: "nodenv, anyenvをアンインストール"
description: ""
publishedAt: 2025-11-12T13:20:48.884Z
preview: ""
draft: false
tags:
  - nodenv
  - anyenv
---

最近のツール管理に[proto | moonrepo](https://moonrepo.dev/proto)を入れたので、これまでお世話になっていたnodenv, anyenvをアンインストールします。

## 環境

- macOS 15.3.2
- MacBook Air M1

## どうやってインストールしていたのか

M1チップが出た時に購入しセットアップしたので、もう5年になるのか…どうやって環境構築をしたのかも忘れています。

```bash
% which nodenv
nodenv not found
```

これは[Nixに移行したときに](https://zenn.dev/kometan/scraps/1893c36c0e4404)パスをロストしちゃってますね。anyenvのストアを探してみると発見。

```bash
% tree -L 2 ~/.anyenv
.anyenv
├── envs
│   ├── nodenv <- ここ！
│   ├── pyenv
│   └── rbenv
└── plugins
    ├── anyenv-git
    └── anyenv-update
```

## nodenvのアンインストール

<https://github.com/nodenv/nodenv?tab=readme-ov-file#uninstalling-node-versions>

docの`#uninstalling-node-versions`を参考にすすめる。

まず、シェルの設定ファイルからnodenvに関係するコードを削除。

```bash:~/.zrc
..
# nodenv
# export PATH="$HOME/.nodenv/bin:$PATH"
eval "$(nodenv init -)"
..
```

ちゃんとコメント書いていた過去の自分に感謝！

実はnix home managerで環境構築をしているので、今この`~/.zshrc`は効果がないのですが、きれいに掃除しておきます。

次に、nodenvのディレクトリを削除。

```bash
rm -rf ~/.anyenv/envs/nodenv/
```

## anyenvのアンインストール

<https://github.com/anyenv/anyenv?tab=readme-ov-file>

ドキュメントにはアンインストールについて記述ないが、インストールを逆に追っていくとよいだろう。ちなみに、Homebrewでインストールしていた。

```bash
% which anyenv
/opt/homebrew/bin/anyenv
```

ぼくの場合`~/.anyenv`がストアとなっていたので削除。

```bash
% rm -rf ~/.anyenv
```

一部ファイルがパーミッションの関係で削除されず。

次に環境変数を削除する。

```bash
..
# anyenv
eval "$(anyenv init -)"
..
```

これらの行を削除。

最後にhomebrewからアンインストール。`brew uninstall anyenv`。anyenvよ、お疲れさま、と思ったところまだ全てのファイルが削除されていなかった。

```bash
.anyenv % tree envs -L 3
envs
└── rbenv
    └── versions
        └── 2.7.6
```

なぜかRuby2.7.6だけが残ってしまった。ひとまず保留しておく。
