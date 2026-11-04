## What it solves

When you hand development over to AI, the spec tends to survive only inside the code. As instructions pile up, the implementation drifts away from what you decided at the start.

ori makes DDD documents the Single Source of Truth. Both the spec and the code are treated as derived from the documents. Only the documents may be edited directly, and changes are propagated slice by slice. What the AI gets is not the freedom to write in any style, but the freedom to fill in a fixed frame.

## The overall flow

A project is set up in the following order.

1. `/ori-init`: Creates the skeleton of `.ori/`.
2. `/ori-distill`: Builds the DDD documents through a conversation with the AI.
3. `/ori-architect`: Decides the architecture from a conversation about requirements and writes it to `.ori/architecture.md`.
4. `/ori-bootstrap`: Guides you through initializing the framework and checks that the project builds.
5. `/ori-flow`: Implements each slice in 7 stages.

When you edit the domain documents after implementation, `/ori-sync` marks the affected slices as dirty. Dirty slices are redone with `/ori-flow`.

## One slice, 7 stages

`/ori-flow` runs through 7 stages in order: derive (create the spec from the documents), plan, test-red (a failing test), impl-green (an implementation that passes the test), refactor, review, and finalize. Each stage can also be run on its own.

A slice cannot be cleaned of its dirty mark until it passes review. If the verdict in `review.md` is not PASS, the script that clears the mark refuses. Even if you edit `status.yaml` by hand, `/ori-doctor` detects it.

## Works with many AI CLIs

It is distributed with Microsoft's [APM](https://github.com/microsoft/apm). You can use it with the same steps from Claude Code, Codex, OpenCode, Cursor, Copilot, Gemini, and Windsurf. So as not to be tied to any one AI, heavy processing is handled by scripts with fixed procedures, and the AI is left to focus on creative judgment.

## An example of real use

[promptnotes](/works/promptnotes) was built with ori. I created the DDD documents from `idea.md`, implemented it slice by slice, and propagated spec changes with `/ori-sync`.

## Status

The flow of starting a brand-new project from scratch works end to end. Retrofitting ori onto an existing codebase is on the roadmap.

The source is published on [GitHub](https://github.com/dev-komenzar/ori) (MIT).
