## 要解決什麼問題

把開發交給 AI 時，規格往往只留在程式碼裡。隨著指令不斷疊加，最初決定的內容和實作會逐漸出現偏差。

ori 把 DDD 的文件作為唯一的事實來源（Single Source of Truth）。規格和程式碼都被視為從文件派生出來的東西。可以直接修改的只有文件，變更以 slice 為單位傳播出去。交給 AI 的，不是用任意風格書寫的自由，而是填滿既定框架的自由。

## 整體流程

專案的啟動按以下順序進行。

1. `/ori-init`：建立 `.ori/` 的骨架。
2. `/ori-distill`：透過與 AI 的對話，編寫 DDD 的文件。
3. `/ori-architect`：根據對需求的討論，在 `.ori/architecture.md` 中確定架構。
4. `/ori-bootstrap`：引導框架的初始化，並確認專案處於可以建置的狀態。
5. `/ori-flow`：按 slice 分 7 個階段進行實作。

實作之後修改領域文件時，用 `/ori-sync` 給受影響的 slice 打上 dirty 標記。dirty 的 slice 再用 `/ori-flow` 重新完成。

## 一個 slice 分 7 個階段

`/ori-flow` 依次進行 derive（從文件生成 spec）、plan、test-red（會失敗的測試）、impl-green（讓測試通過的實作）、refactor、review、finalize 這 7 個階段。每個階段也可以單獨執行。

不通過 review，就無法解除 dirty。如果 `review.md` 的判定不是 PASS，解除用的腳本會拒絕執行。即使手動改寫 `status.yaml`，`/ori-doctor` 也會檢測出來。

## 支援多種 AI CLI

分發使用的是 Microsoft 的 [APM](https://github.com/microsoft/apm)。在 Claude Code、Codex、OpenCode、Cursor、Copilot、Gemini、Windsurf 中都能用同樣的步驟使用。為了不被特定的 AI 綁住，我採用了這樣的分工：繁重的處理交給按固定步驟執行的腳本，讓 AI 專注於創造性的判斷。

## 實際使用的例子

[promptnotes](/zh-hant/works/promptnotes) 就是用 ori 做的。從 `idea.md` 生成 DDD 的文件，按 slice 實作，規格的變更也透過 `/ori-sync` 傳播。

## 現狀

從零開始啟動新專案的流程，已經可以完整跑通。為已有的程式碼庫後續引入 ori，是今後的路線圖。

原始碼已在 [GitHub](https://github.com/dev-komenzar/ori) 公開（MIT）。
