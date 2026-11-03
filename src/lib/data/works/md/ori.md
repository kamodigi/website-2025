---
id: 'ori'
title:
  ja: 'ori（織）'
  en: 'ori'
shortDescription:
  ja: 'DDD のドキュメントを唯一の正として、slice ごとに軽量な TDD と変更の伝播を回す開発フレームワーク'
  en: 'DDD のドキュメントを唯一の正として、slice ごとに軽量な TDD と変更の伝播を回す開発フレームワーク'
description:
  ja: 'DDD のドキュメントを Single Source of Truth とし、slice ごとに軽量な TDD と変更の伝播を回す開発フレームワーク。Claude Code、Codex、Cursor など、多くの AI CLI に対応しています。MIT ライセンスで公開しています。'
  en: 'DDD のドキュメントを Single Source of Truth とし、slice ごとに軽量な TDD と変更の伝播を回す開発フレームワーク。Claude Code、Codex、Cursor など、多くの AI CLI に対応しています。MIT ライセンスで公開しています。'
technologies:
  - 'TypeScript'
  - 'DDD'
  - 'TDD'
  - 'APM'
category: 'other'
status: 'in-progress'
startDate: '2026-05-13'
images:
  thumbnail: 'ori/thumbnail-light.webp'
  gallery:
    - 'ori/flow-light.webp'
    - 'ori/phases-light.webp'
links:
  github: 'https://github.com/dev-komenzar/ori'
order: 3
---

## 何を解決するか

AI に任せて開発すると、仕様がコードの中にしか残らなくなりがちです。指示を重ねるうちに、最初に決めたことと実装がずれていきます。

ori は、DDD のドキュメントを唯一の正（Single Source of Truth）にします。仕様もコードも、ドキュメントから派生するものとして扱います。直接直してよいのはドキュメントだけで、変更は slice 単位で伝播させます。AI に与えるのは、任意のスタイルで書く自由ではなく、決められた枠を埋める自由です。

## 全体の流れ

プロジェクトの立ち上げは、次の順に進めます。

1. `/ori-init`: `.ori/` の骨組みを作ります。
2. `/ori-distill`: AI との対話で、DDD のドキュメントを作ります。
3. `/ori-architect`: 要件の対話から、アーキテクチャを `.ori/architecture.md` に決めます。
4. `/ori-bootstrap`: フレームワークの初期化を案内し、ビルドできる状態か確認します。
5. `/ori-flow`: slice ごとに 7 段階で実装します。

実装のあとにドメインのドキュメントを直したときは、`/ori-sync` で影響する slice に dirty の印を付けます。dirty な slice は、`/ori-flow` でやり直します。

## 1 つの slice は 7 段階

`/ori-flow` は、derive（ドキュメントから spec を作る）、plan、test-red（失敗するテスト）、impl-green（テストを通す実装）、refactor、review、finalize の 7 段階を順に進めます。各段階は、単独でも実行できます。

review を通らないと、dirty は解除できません。`review.md` の判定が PASS でなければ、解除のスクリプトが拒否します。`status.yaml` を手で書き換えても、`/ori-doctor` が検出します。

## 多くの AI CLI に対応

配布には Microsoft の [APM](https://github.com/microsoft/apm) を使っています。Claude Code、Codex、OpenCode、Cursor、Copilot、Gemini、Windsurf から、同じ手順で使えます。特定の AI に縛られないように、重い処理は決まった手順のスクリプトが受け持ち、AI は創造的な判断に集中させる分担にしました。

## 実際に使った例

[promptnotes](/works/promptnotes) は、ori で作りました。`idea.md` から DDD のドキュメントを作り、slice ごとに実装し、仕様の変更も `/ori-sync` で伝播させています。

## 状態

v0.4.0 の時点で、新規のプロジェクトを 0 から立ち上げる流れは通しで動きます。既存のコードベースへの後付けは、これからのロードマップです。

ソースは [GitHub](https://github.com/dev-komenzar/ori) で公開しています（MIT）。
