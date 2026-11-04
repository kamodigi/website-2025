## 要解决什么问题

把开发交给 AI 时，规格往往只留在代码里。随着指令不断叠加，最初决定的内容和实现会逐渐出现偏差。

ori 把 DDD 的文档作为唯一的事实来源（Single Source of Truth）。规格和代码都被视为从文档派生出来的东西。可以直接修改的只有文档，变更以 slice 为单位传播出去。交给 AI 的，不是用任意风格书写的自由，而是填满既定框架的自由。

## 整体流程

项目的启动按以下顺序进行。

1. `/ori-init`：创建 `.ori/` 的骨架。
2. `/ori-distill`：通过与 AI 的对话，编写 DDD 的文档。
3. `/ori-architect`：根据对需求的讨论，在 `.ori/architecture.md` 中确定架构。
4. `/ori-bootstrap`：引导框架的初始化，并确认项目处于可以构建的状态。
5. `/ori-flow`：按 slice 分 7 个阶段进行实现。

实现之后修改领域文档时，用 `/ori-sync` 给受影响的 slice 打上 dirty 标记。dirty 的 slice 再用 `/ori-flow` 重新完成。

## 一个 slice 分 7 个阶段

`/ori-flow` 依次进行 derive（从文档生成 spec）、plan、test-red（会失败的测试）、impl-green（让测试通过的实现）、refactor、review、finalize 这 7 个阶段。每个阶段也可以单独执行。

不通过 review，就无法解除 dirty。如果 `review.md` 的判定不是 PASS，解除用的脚本会拒绝执行。即使手动改写 `status.yaml`，`/ori-doctor` 也会检测出来。

## 支持多种 AI CLI

分发使用的是 Microsoft 的 [APM](https://github.com/microsoft/apm)。在 Claude Code、Codex、OpenCode、Cursor、Copilot、Gemini、Windsurf 中都能用同样的步骤使用。为了不被特定的 AI 绑定，我采用了这样的分工：繁重的处理交给按固定步骤运行的脚本，让 AI 专注于创造性的判断。

## 实际使用的例子

[promptnotes](/works/promptnotes) 就是用 ori 做的。从 `idea.md` 生成 DDD 的文档，按 slice 实现，规格的变更也通过 `/ori-sync` 传播。

## 现状

从零开始启动新项目的流程，已经可以完整跑通。为已有的代码库后续引入 ori，是今后的路线图。

源代码已在 [GitHub](https://github.com/dev-komenzar/ori) 公开（MIT）。
