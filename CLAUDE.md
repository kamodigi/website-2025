# Project Instructions for AI Agents

This file provides instructions and context for AI coding agents working on this project.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:1105d646 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/core-concepts/sync-concepts.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->


## Build & Test

_Add your build and test commands here_

```bash
# Example:
# npm install
# npm test
```

## Architecture Overview

_Add a brief overview of your project architecture_

## Conventions & Patterns

_Add your project-specific conventions here_

## UI を変更するときの進め方

UI を変更する issue では、次のサイクルを必ず回す（2026-11-03 に決定）。

1. **実装**（ワーカー）
2. **一般的なレビュー**（実装者とは別のエージェント）: 正しさ、アクセシビリティ、ja/en の多言語対応、ビルドと lint
3. **デザインの整合性のレビュー**（さらに別のエージェント）: [docs/design-review.md](docs/design-review.md) の確認項目に沿って、サイト全体の見た目との整合性を見る
4. **人間のレビュー**: **文章の修正はここで行う**。ワーカーの文章は下書き扱い。

ルール:

- 2 と 3 のレビュアーは、結果を **PR のコメント**に残す。
- 実装者は自分の変更を承認しない。承認は別のエージェントか人間が行う。
- 人間が文章を直した後は、2〜3 をやり直さない。ビルドと lint、スクリーンショット（{言語} × {light, dark} × {375px, 1280px}）を見るだけにする。
- 例外: LP のキャッチコピーのように、レイアウトを左右する文言は、issue を起票する前に人間と決めて issue に書く。
- 翻訳を足すときは、翻訳 → 別のエージェントが日本語に訳し戻して意味のずれを確認 → その言語でデザインの整合性レビュー → 英語のみ人間が確認、の順に進める。デザインの確認項目の言語の組み合わせは、その時点でサイトにある言語すべてにする。
