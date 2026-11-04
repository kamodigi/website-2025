---
id: 'promptnotes'
title:
  ja: 'promptnotes'
  en: 'promptnotes'
shortDescription:
  ja: 'AI に送る前のプロンプトを、Enter を押しても送信されない場所で書き溜めるデスクトップのメモアプリ'
  en: 'A desktop note-taking app for drafting prompts before sending them to an AI, where pressing Enter never sends anything'
description:
  ja: 'Claude Code や Codex で Enter を押して意図せず送信してしまう悩みから作った、プロンプト専用のデスクトップのメモアプリ。Tauri v2、SvelteKit、Rust、CodeMirror 6 で作り、開発には自作のフレームワーク ori を使いました。'
  en: 'A desktop note-taking app made just for prompts, born from the annoyance of accidentally sending a prompt by pressing Enter in Claude Code or Codex. Built with Tauri v2, SvelteKit, Rust, and CodeMirror 6, and developed with ori, my own framework.'
technologies:
  - 'Tauri v2'
  - 'SvelteKit'
  - 'Rust'
  - 'CodeMirror 6'
category: 'desktop'
status: 'in-progress'
startDate: '2026-06-11'
images:
  thumbnail: 'promptnotes/thumbnail-light.webp'
  gallery:
    - 'promptnotes/feed-light.webp'
    - 'promptnotes/icon.webp'
links:
  github: 'https://github.com/dev-komenzar/promptnotes'
order: 2
---

## 作った背景

Claude Code や Codex では、プロンプトを入力している途中で Enter を押すと、その場で AI に送信されます。書きかけのプロンプトを、意図せず送ってしまった経験が何度もありました。

promptnotes は、AI に送る前のプロンプトを書くための専用のエディタです。Enter は安心して改行に使えます。送信ではなく「書き溜めておいて、あとでコピーして使う」ためのアプリなので、AI を呼び出す機能は持っていません。

ノートはすべてローカルの `.md` ファイルとして保存します。ほかのツールと共存でき、データの持ち出しも自由です。

## 技術選定

- **Tauri v2**: デスクトップアプリの土台です。macOS と Linux 向けに配布しています。
- **SvelteKit**: 画面は SvelteKit（static adapter）で作りました。このサイトと同じ、好きなフレームワークです。
- **Rust**: ファイルの保存や更新の確認など、OS に近い処理は Tauri のコマンドとして Rust で書いています。
- **CodeMirror 6**: Markdown のシンタックスハイライト、リストやブラケットの補完を任せています。

## ori を使った開発の進め方

開発には、自作のフレームワーク [ori](/works/ori) を使いました。まず `idea.md` に、作りたいものと「やってはいけないこと」を書き下しました。そこから ori で DDD のドキュメント（`.ori/domain/`）を作り、以降はそのドキュメントを唯一の正としています。

ドキュメントでは、アプリを 4 つの境界づけられたコンテキスト（ノートの作成、フィード、設定、アップデート）に分けました。実装は slice 単位（ノートの作成、自動保存、検索条件の更新など）で、テストを先に書いてから進めます。仕様を変えたいときは、コードではなくドメインのドキュメントを直し、影響する slice をやり直します。

## 設計で守ったこと

`idea.md` には、守ることを最初に書きました。とくに過去の実装で AI がしたミスを、再発禁止として並べています。

- **シングルペインだけにする**: サイドバーを付けない。AI は「ノートアプリ」と聞くと、サイドバーとメインペインの構成にしたがります。
- **アプリ名のヘッダーを置かない**: OS のタイトルバーがあるので、その下に同じ名前の帯を作らない。
- **プレビューと編集で、同じ描画の仕組みを使う**: 表示用の HTML と編集用の CodeMirror を切り替えると、行の高さが変わって座標がずれます。そのため CodeMirror を常に表示し、`readOnly` の切り替えだけで編集に入ります。

ブロックの状態は、IDLE（何もしていない）、FOCUSED（キーボードで選択中）、EDITING（編集中）の 3 つだけにしました。状態遷移を文書に書いておいたので、余計な状態が増えにくくなっています。

## 苦労した点

- **アップデートの通知**: 更新を確認する機能（slice）は作ってあったのに、v0.2.2 と v0.2.3 では、アプリの起動時の処理につなぐのを忘れていました。新しいバージョンが出ても通知されず、手動で入れ替えてもらう必要がありました。v0.2.4 で、起動時と 24 時間ごとの確認をつなぎました。
- **macOS の配布**: Apple Developer Program に登録していないため、公証されていません。初回の起動で Gatekeeper の警告が出るので、回避の手順を README に書いています。
- **ツールチェーンの固定**: Nix の flake で開発環境を固定していますが、依存を更新するたびにハッシュを直す作業が必要でした。

## これから

AI に送る前の下書きを置く場所として、日々の使い勝手を磨いていきます。ダウンロードは [GitHub の Releases](https://github.com/dev-komenzar/promptnotes/releases) から行えます。
