# GitHub Actions 學習進度追蹤

> 追蹤 Claude Code + GitHub Actions 整合的學習進度
>
> **學習計劃：** [GITHUB_ACTIONS_LEARNING_PLAN.md](./GITHUB_ACTIONS_LEARNING_PLAN.md)
> **開始日期：** 2025-09-30

---

## 📊 整體進度

- [x] 階段一：基礎設定與驗證（1-2 天）✅ **完成!**
- [ ] 階段二：為 cc-statusline 客製化（3-4 天）- 準備開始
- [ ] 階段三：進階整合（5-6 天）
- [ ] 階段四：探索與優化（7+ 天）

**目前階段：** 階段二 - 準備建立 CI Pipeline
**完成度：** 100% 階段一 | 0% 階段二
**階段一完成日：** 2025-09-30

---

## 🎯 階段一：基礎設定與驗證

**目標完成日：** 2025-09-30

### 前置檢查

- [x] 理解 GitHub Actions 基本概念
- [x] 理解 YAML 語法
- [x] 了解 GitHub Secrets 管理
- [x] 熟悉 Claude Code 基本使用

### Task 1.1: 設定 Claude GitHub App ✅

**開始時間：** 2025-09-30 14:00
**完成時間：** 2025-09-30 14:15

- [x] 訪問 https://github.com/apps/claude
- [x] 安裝 app 到 GregoryHo/cc-statusline
- [x] 授權必要權限
- [x] 獲取 OAuth Token
- [x] 設定 `CLAUDE_CODE_OAUTH_TOKEN` secret
- [x] 驗證 secret 已正確設定

**遇到的問題：**
```
1. 第一次嘗試: "Failed to access repository GregoryHo/cc-statusline"
2. 第二次嘗試: "GitHub CLI is missing required permissions: workflow"
3. 第三次嘗試: 成功! "GitHub Actions setup complete!"
```

**解決方案：**
```
使用 Claude Code 的 `/install-github-app` 指令
- 指令會自動處理 GitHub App 安裝
- 自動設定 CLAUDE_CODE_OAUTH_TOKEN secret
- 自動授權必要的 workflow 權限
```

### Task 1.2: 測試互動式 Claude ✅

**開始時間：** 2025-09-30 14:20
**完成時間：** 2025-09-30 15:10

- [x] 建立測試 branch: `test/claude-github-actions`
- [x] 建立測試檔案並 commit (docs/TESTING.md)
- [x] Push 並建立 PR
- [x] 在 PR 中 comment `@claude`
- [x] 確認 workflow 被觸發
- [x] 確認 Claude 有回應

**Claude 回應連結：**
```
PR #2: https://github.com/GregoryHo/cc-statusline/pull/2
Comment: https://github.com/GregoryHo/cc-statusline/pull/2#issuecomment-3350072208
```

**觀察與心得：**
```
✅ claude.yml workflow 執行成功 (issue_comment 觸發)

Claude 的回應品質 - 非常詳細且專業:
- 📋 PR Review Complete
- 🎯 清楚說明能力範圍 (capabilities & limitations)
- 🔍 Code Quality & Best Practices 分析
- 📚 Documentation Quality 評估
- 🛡️ Security Analysis
- ⚡ Performance Considerations
- 🐛 Potential Issues (正確識別測試代碼是故意的)
- 🧪 Test Coverage Assessment
- 📈 Recommendations (實用的優化建議)

觸發速度:
- 非常快速 (~30 秒內完成)
- @claude mention 立即被識別
- workflow 執行穩定

特別優秀的部分:
✅ 正確理解測試意圖 (識別故意加入的代碼問題是用來測試的)
✅ 提供具體且可行的改進建議
✅ 建議加入 use_sticky_comment, path filters, skip conditions
✅ 評估為 "Excellent implementation - ready for production use!"

沒有意外行為,整體體驗極佳! 🌟
```

### Task 1.3: 測試自動 Code Review ✅

**開始時間：** 2025-09-30 14:20
**完成時間：** 2025-09-30 15:00

- [x] 在測試 PR 加入可改進的代碼 (docs/TESTING.md)
- [x] Push 並等待自動 review 觸發
- [x] 分析 review comments 的品質
- [x] 成功收到 Claude 的自動 review

**Review 品質評估：**
```
✅ claude-code-review.yml workflow 執行成功

Claude 的回應內容:
📋 PR Review Complete

🎯 My Capabilities in GitHub Actions

What I can do:
- Provide detailed code reviews with specific line-by-line feedback
- Answer questions about code, architecture, and best practices
- Analyze documentation for completeness and accuracy
- Execute build/test commands when granted appropriate permissions
- Create and commit code changes when requested
- Generate reports and summaries

Current limitations:
- Cannot modify .github/workflows/ files due to GitHub App permissions
- Cannot approve/merge PRs (security requirement)
- Only communicate through comment updates (no separate review submission)

評價:
✅ 自動觸發成功 (pull_request: synchronize)
✅ 清楚說明了 Claude 的能力範圍
✅ 提供了實用的限制說明
⚠️  未針對 docs/TESTING.md 中的測試代碼進行具體 review
   (可能是因為測試代碼在 markdown code block 中)
```

### 階段一總結 ✅

**完成日期：** 2025-09-30

**學到的重點：**
1. **GitHub Actions 權限管理**: workflow 的 permissions 必須明確設定 write 權限才能發表 comments,即使 GitHub App 已授權
2. **兩種 Claude 整合模式**: 自動觸發 (pull_request events) vs 互動式 (@claude mentions)
3. **Workflow 觸發機制**: pull_request: synchronize 會在每次 push 新 commit 時自動觸發
4. **Claude 的回應品質**: 非常專業且詳細,能正確理解上下文和測試意圖
5. **問題排查方法**: 查看 Actions logs 的錯誤訊息是關鍵

**遇到的挑戰：**
1. `/install-github-app` 前兩次失敗 (權限問題) - 第三次成功
2. Workflow 權限不足導致 "Resource not accessible by integration" 錯誤
3. Forked repository Actions 預設停用需手動啟用

**改進想法：**
1. 根據 Claude 建議加入 `use_sticky_comment: true` 減少重複 comments
2. 加入 path filters 優化 workflow 觸發,節省 API costs
3. 加入 skip conditions 跳過 WIP/draft PRs
4. 考慮針對專案需求客製化 review prompts (階段二 Task 2.3)

---

## 🔧 階段二：為 cc-statusline 客製化

**目標完成日：** ___________

### Task 2.1: 建立 CI Pipeline

**開始時間：** ___________
**完成時間：** ___________

- [ ] 建立 `.github/workflows/ci.yml`
- [ ] 設定 build job
- [ ] 設定 test job
- [ ] 設定 performance benchmark
- [ ] Push 並驗證執行
- [ ] 修正失敗的測試

**CI 執行結果：**
```
- Build 時間：
- Test 通過率：
- Performance 結果：
```

**優化記錄：**
```
記錄如何優化 CI 速度...
```

### Task 2.2: 新增 Version 一致性檢查

**開始時間：** ___________
**完成時間：** ___________

- [ ] 建立 `.github/workflows/version-check.yml`
- [ ] 實作版本號提取邏輯
- [ ] 實作比較邏輯
- [ ] 測試故意不一致的情況
- [ ] 驗證錯誤訊息清楚

**測試結果：**
```
- Mismatch detection: ✅/❌
- Error message 清晰度:
- 執行速度:
```

### Task 2.3: 優化 Claude Code Review Prompt ✅

**開始時間：** 2025-09-30 15:30
**完成時間：** 2025-09-30 15:45

**執行順序調整說明：**
```
原始順序: 2.1 → 2.2 → 2.3 → 2.4
實際順序: 2.3 → 2.4 → 2.1 → 2.2

理由: 先完成快速任務 (2.3, 2.4) 建立動力，再進行較複雜的任務 (2.1, 2.2)
```

- [x] 修改 `claude-code-review.yml`
- [x] 加入專案特定檢查清單
- [x] 啟用 use_sticky_comment
- [x] 加入 path filters (cost optimization)
- [x] 加入 skip conditions (draft PRs, [skip-review], WIP)

**Prompt 優化內容：**

**1. 專案上下文 (Project Context)**
```yaml
- TypeScript CLI tool using ESM modules
- Generates bash scripts for terminal statuslines
- Uses Commander.js, Inquirer.js, Chalk, Ora
- Generated bash scripts must be POSIX-compliant
```

**2. 檢查清單 (Review Checklist)**
- ✅ Version Consistency (CRITICAL) - 3 檔案同步檢查
- ✅ Documentation requirements (CHANGELOG, README, CLAUDE.md)
- ✅ TypeScript/ESM conventions (.js extensions, no semicolons)
- ✅ Bash Script Quality (POSIX compliance, quote escaping)
- ✅ Performance targets (<500ms execution)

**3. 成本優化設定**
- ✅ `use_sticky_comment: true` - 重複使用同一個 comment
- ✅ Path filters - 只在代碼改動時觸發
- ✅ Skip conditions - 跳過 draft/WIP PRs

**4. Review Style Guidelines**
- Severity levels: 🔴 BLOCKER, 🟡 SUGGESTION, 🟢 NITPICK, 💡 TIP
- Specific and actionable feedback
- Explain "why" behind suggestions

**預期效果：** (待下次 PR 驗證)
| 項目 | 優化前 | 優化後 (預期) |
|------|--------|--------------|
| 專案特定檢查 | ❌ 通用 | ✅ cc-statusline 專用 |
| Version 一致性檢查 | ❌ 無 | ✅ 自動檢查 3 檔案 |
| Bash 品質檢查 | ❌ 無 | ✅ POSIX, quote escaping |
| 成本優化 | ❌ 每次都觸發 | ✅ 僅代碼改動時 |
| Review 清晰度 | ⚠️ 普通 | ✅ 結構化 + 嚴重程度標示 |

**Commit:** `87f5126` - feat: optimize Claude code review workflow with project-specific prompts

### Task 2.4: 啟用 Claude 工具執行 ✅

**開始時間：** 2025-09-30 16:00
**完成時間：** 2025-09-30 16:10

- [x] 修改 `claude.yml` 加入 `allowed_tools`
- [x] 加入 `custom_instructions`
- [ ] 測試請 Claude 執行 build (待新 PR 測試)
- [ ] 測試請 Claude 執行 tests (待新 PR 測試)
- [ ] 驗證輸出在 comment 中顯示 (待新 PR 測試)

**Allowed Tools 清單：**
```bash
# Build & Development
- npm run build
- npm run dev
- npm ci

# CLI Testing
- ./dist/index.js --version
- ./dist/index.js init --defaults --no-install
- ./dist/index.js preview ./.claude/statusline.sh

# Testing & Benchmarking
- npx tsx test/performance/benchmark.ts
- ./test/test-installation.sh
```

**Custom Instructions 內容：**
- ✅ ESM imports with .js extensions
- ✅ Version consistency (3 files)
- ✅ Conventional commits format
- ✅ CHANGELOG.md update requirements
- ✅ Project structure overview
- ✅ Development workflow guidelines
- ✅ POSIX compliance requirements
- ✅ Performance targets (<500ms)

**測試計劃：** (待新 PR)
```
測試指令：
1. @claude 請執行 npm run build
2. @claude 請檢查 CLI version
3. @claude 請運行 performance benchmark
4. @claude 請執行 installation test

預期：Claude 能成功執行並在 comment 中顯示輸出
```

**Commit:** `aa81540` - feat: enable Claude tool execution with project-specific instructions

### 階段二總結

**完成日期：** ___________

**客製化效果：**
```
對比通用 vs 客製化的 Claude review:
- 相關性提升：
- 準確度提升：
- 實用性提升：
```

**下一步優化方向：**
1.
2.

---

## 🚀 階段三：進階整合

**目標完成日：** ___________

### Task 3.1: Release 準備 Workflow

**開始時間：** ___________
**完成時間：** ___________

- [ ] 建立 `prepare-release.yml`
- [ ] 實作版本號更新邏輯
- [ ] 整合 Claude 生成 CHANGELOG
- [ ] 測試 workflow_dispatch
- [ ] 驗證自動建立 PR

**Release Workflow 測試：**
```
測試版本：
- 執行時間：
- CHANGELOG 品質：
- 需要手動調整的地方：
```

### Task 3.2: 智能觸發條件

**開始時間：** ___________
**完成時間：** ___________

- [ ] 加入 skip 條件
- [ ] 加入檔案路徑過濾
- [ ] 實作 sticky comment
- [ ] 測試不同觸發場景

**成本優化效果：**
```
優化前每月觸發次數：
優化後每月觸發次數：
節省比例：
```

### Task 3.3: 監控與分析

**開始時間：** ___________
**完成時間：** ___________

- [ ] 建立 `review-metrics.yml`
- [ ] 設定週期性執行
- [ ] 分析 review effectiveness
- [ ] 根據數據調整策略

**Metrics 追蹤：**

| 週次 | PRs Reviewed | Issues Found | False Positives | Satisfaction |
|------|--------------|--------------|-----------------|--------------|
| Week 1 | | | | |
| Week 2 | | | | |
| Week 3 | | | | |
| Week 4 | | | | |

### 階段三總結

**完成日期：** ___________

**自動化程度：**
```
- Release 流程自動化：___%
- 成本優化效果：___%
- 監控覆蓋率：___%
```

---

## 🎓 階段四：探索與優化

**目標完成日：** ___________

### 實驗記錄

#### 實驗 1: _____________________

**假設：**
```
我認為...
```

**實驗設計：**
```
1.
2.
3.
```

**結果：**
```
實際發現...
```

**結論：**
```
學到的經驗...
```

---

#### 實驗 2: _____________________

**假設：**
```

```

**實驗設計：**
```

```

**結果：**
```

```

**結論：**
```

```

---

### 最佳實踐總結

#### Prompt Engineering

**有效的 Prompt 模式：**
```
1.
2.
3.
```

**應該避免的：**
```
1.
2.
```

#### Workflow 設計

**推薦的架構：**
```
1.
2.
```

**踩過的坑：**
```
1.
2.
```

#### 成本管理

**省錢技巧：**
```
1.
2.
```

**值得投資的地方：**
```
1.
2.
```

---

## 📝 每日學習日誌

### 2025-09-30 (Day 1)

**今日目標：**
- [x] 安裝並設定 Claude GitHub App ✅
- [x] 建立測試 PR ✅
- [x] 完成互動式 Claude 測試 (Task 1.2 ✅)
- [x] 完成自動 Code Review 測試 (Task 1.3 ✅)
- [x] **階段一完成!** 🎉

**完成事項：**
- ✅ 使用 `/install-github-app` 成功安裝 Claude GitHub App
- ✅ 設定 `CLAUDE_CODE_OAUTH_TOKEN` secret
- ✅ 建立測試 branch: `test/claude-github-actions`
- ✅ 建立 PR #2: https://github.com/GregoryHo/cc-statusline/pull/2
- ✅ 更新學習進度追蹤文件
- ✅ 修復 workflow 權限問題 (pull-requests: write, issues: write)
- ✅ 成功測試自動 Code Review 功能 (claude-code-review.yml)
- ✅ 成功測試互動式 Claude 功能 (claude.yml + @claude mentions)
- ✅ **完成階段一所有任務!**

**學到的新知識：**
- Claude Code 的 `/install-github-app` 指令會自動處理整個設定流程
- GitHub Actions workflows 透過 `anthropics/claude-code-action@beta` 整合
- 兩種 workflow 模式:
  - `claude.yml`: 需要 @claude mention 觸發 (互動式)
  - `claude-code-review.yml`: 自動觸發 (PR opened/synchronize)
- GitHub Actions 需要明確的 write 權限才能發表 comments
- Forked repositories 預設會停用 GitHub Actions (需手動啟用)
- Workflow 的 permissions 設定獨立於 GitHub App 權限

**遇到的問題：**
- ❌ 前兩次 `/install-github-app` 失敗 (權限問題)
- ✅ 第三次嘗試成功
- ❌ Workflow 執行失敗: "Resource not accessible by integration"
- ✅ 解決方法: 將 permissions 從 read 改為 write

**明天計劃：**
- 完成 Task 1.2: 測試 @claude 互動功能
- 根據測試結果優化 workflow prompts (階段二 Task 2.3)
- 開始階段二 Task 2.1: 建立 CI Pipeline
- 開始階段二 Task 2.2: Version 一致性檢查

---

### YYYY-MM-DD (Day X)

**今日目標：**
- [ ]

**完成事項：**
-

**學到的新知識：**
-

**遇到的問題：**
-

**明天計劃：**
-

---

## 🐛 問題與解決方案

### 問題 1: Claude Workflow 權限不足 ✅ 已解決

**現象：**
```
啟用 GitHub Actions 後，在 PR 中使用 @claude 觸發互動式 Claude
workflow 執行但失敗，顯示 "Failure" 狀態
```

**錯誤訊息：**
```
Process completed with exit code 1.
Prepare step failed with error: Resource not accessible by integration -
https://docs.github.com/rest/issues/comments#create-an-issue-comment
```

**根本原因：**
- workflow 的 `permissions` 只有 `read` 權限
- Claude 需要 `write` 權限才能發表 comments
- 兩個 workflows 都有此問題: `claude.yml` 和 `claude-code-review.yml`

**最終解決方案：**
```yaml
# 修改 .github/workflows/claude.yml 和 claude-code-review.yml
permissions:
  contents: read
  pull-requests: write  # 從 read 改為 write
  issues: write         # 從 read 改為 write
  id-token: write
  actions: read         # (claude.yml only)
```

**Commit:** `8a825d8` - fix: add write permissions for Claude workflows to post comments

**經驗教訓：**
```
1. GitHub Actions workflows 需要明確授予 write 權限才能修改 PR/Issue
2. 錯誤訊息 "Resource not accessible by integration" 通常表示權限不足
3. 即使 GitHub App 有權限，workflow 的 permissions 也必須正確設定
4. 測試時要仔細查看 Actions logs 的錯誤訊息
```

---

## 💡 想法與改進

### 改進想法 1: _____________________

**現狀問題：**
```

```

**改進方案：**
```

```

**預期效果：**
```

```

**實施狀態：** 💭 構思中 / 🚧 實驗中 / ✅ 已實施 / ❌ 放棄

---

## 📚 額外學習資源

### 推薦閱讀

- [ ] 文章/教學名稱 - URL
  - **重點筆記：**

### 參考專案

- [ ] 專案名稱 - URL
  - **值得學習的地方：**

### 社群討論

- [ ] 討論串 - URL
  - **關鍵見解：**

---

## 🎯 長期目標

- [ ] 建立 cc-statusline 的完整 CI/CD pipeline
- [ ] 實現 80% 以上的 release 流程自動化
- [ ] 優化 API 成本至合理範圍
- [ ] 撰寫 GitHub Actions 整合經驗分享
- [ ] 貢獻回饋給社群

---

**最後更新：** 2025-09-30
**總學習時數：** ~2 小時
**完成進度：** 25% (階段一 ✅)