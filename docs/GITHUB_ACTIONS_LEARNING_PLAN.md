# Claude Code + GitHub Actions 學習計劃

> 學習如何整合 Claude Code 與 GitHub Actions 以自動化 cc-statusline 專案的開發流程

**目標時間：** 7-14 天
**進度追蹤：** 見 [GITHUB_ACTIONS_PROGRESS.md](./GITHUB_ACTIONS_PROGRESS.md)

---

## 📚 前置知識檢查

在開始前，建議先了解：
- [ ] GitHub Actions 基本概念（workflows, jobs, steps）
- [ ] YAML 語法基礎
- [ ] GitHub Secrets 管理
- [ ] Claude Code 基本使用

**快速學習資源：**
- [GitHub Actions 官方文檔](https://docs.github.com/en/actions)
- [Claude Code 文檔](https://docs.claude.com/en/docs/claude-code)

---

## 🎯 階段一：基礎設定與驗證（1-2 天）

### 學習目標

1. 理解 GitHub Actions 的觸發機制
2. 成功設定 Claude GitHub App 整合
3. 驗證現有 workflows 能正常運作

### 現有 Workflows 分析

#### `claude.yml` - 互動式 Claude
```yaml
觸發條件：
- issue_comment (需包含 @claude)
- pull_request_review_comment (需包含 @claude)
- pull_request_review (需包含 @claude)
- issues (opened/assigned，需包含 @claude)

功能：
- 在 PR/Issue 中透過 @claude 互動
- 可以執行被允許的指令
- 可以讀取 CI 結果
```

#### `claude-code-review.yml` - 自動 PR Review
```yaml
觸發條件：
- pull_request (opened/synchronize)

功能：
- 自動 review 每個 PR
- 檢查 code quality, bugs, performance, security, tests
- 無需 @claude mention，完全自動
```

### 實作任務

#### Task 1.1: 設定 Claude GitHub App

**步驟：**
1. 安裝 Claude GitHub App
   - 訪問：https://github.com/apps/claude
   - 點擊 "Install"
   - 選擇 `GregoryHo/cc-statusline` repository
   - 授權必要權限：
     - Read access to code
     - Read access to issues and pull requests
     - Write access to pull request comments

2. 獲取 OAuth Token
   - 方法一：使用 `/install-github-app` 指令（需要 gh CLI）
   - 方法二：從 Claude dashboard 生成

3. 設定 Repository Secret
   - 前往：https://github.com/GregoryHo/cc-statusline/settings/secrets/actions
   - New repository secret
   - Name: `CLAUDE_CODE_OAUTH_TOKEN`
   - Value: [你的 token]
   - 保存

**驗證：**
- [ ] Claude App 已安裝到 repository
- [ ] `CLAUDE_CODE_OAUTH_TOKEN` secret 已設定
- [ ] Secret 可以在 Actions 中看到（但看不到值）

#### Task 1.2: 測試互動式 Claude (claude.yml)

**步驟：**
1. 建立測試 PR
   ```bash
   git checkout -b test/claude-interaction
   echo "# Test Claude Interaction" > docs/TEST_CLAUDE.md
   git add docs/TEST_CLAUDE.md
   git commit -m "test: claude github actions interaction"
   git push -u origin test/claude-interaction
   ```

2. 在 GitHub 上建立 PR

3. 在 PR 中 comment:
   ```
   @claude 請幫我檢查這個測試 PR，並說明你能做什麼
   ```

4. 觀察 Actions tab 的執行狀況

**預期結果：**
- [ ] Workflow 被觸發
- [ ] Claude 在 PR 中回應
- [ ] 回應內容合理且有幫助

**Troubleshooting：**
- 如果 404 錯誤：檢查 secret 是否正確設定
- 如果沒有觸發：檢查 comment 是否包含 `@claude`
- 如果執行失敗：查看 Actions logs

#### Task 1.3: 測試自動 Code Review (claude-code-review.yml)

**步驟：**
1. 在同一個測試 PR 中做一些改動
   ```bash
   # 故意加入一些可改進的代碼
   cat >> docs/TEST_CLAUDE.md <<'EOF'

   ## Test Code

   ```typescript
   function test() {
     var x = 1;  // 使用 var 而非 const
     console.log(x);
   }
   ```
   EOF

   git add docs/TEST_CLAUDE.md
   git commit -m "test: add code for claude review"
   git push
   ```

2. 觀察是否自動觸發 review

**預期結果：**
- [ ] PR synchronize 時自動觸發 workflow
- [ ] Claude 自動提供 review comments
- [ ] Review 指出代碼可改進之處（例如 var -> const）

**學習重點：**
- 對比 `claude.yml` (需要 @claude) vs `claude-code-review.yml` (自動)
- 理解 `direct_prompt` 參數的作用

### 驗收標準

完成此階段後你應該能夠：
- [x] 解釋 GitHub Actions 的基本運作原理
- [x] 成功設定 Claude GitHub App 整合
- [x] 使用 @claude 在 PR 中互動
- [x] 理解自動 review 與手動觸發的差異

---

## 🔧 階段二：為 cc-statusline 客製化（3-4 天）

### 學習目標

1. 建立標準的 CI/CD pipeline
2. 針對 cc-statusline 專案特性優化 Claude prompts
3. 啟用 Claude 執行測試和 build 指令

### 專案特定需求分析

cc-statusline 專案的特殊檢查需求：
1. **Version 一致性**：package.json, src/index.ts, src/generators/bash-generator.ts
2. **Bash Script 品質**：POSIX compliance, quote escaping
3. **Documentation 同步**：CHANGELOG.md, README.md
4. **TypeScript**：ESM imports (需要 .js extensions)
5. **Performance**：statusline 執行速度 <500ms

### 實作任務

#### Task 2.1: 建立 CI Pipeline

**目標：** 在每次 push 和 PR 時自動執行 build 和 tests

**新增檔案：** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Build and Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Verify CLI works
        run: ./dist/index.js --version

      - name: Run tests
        run: |
          # Installation test
          ./test/test-installation.sh

      - name: Performance benchmark
        run: npx tsx test/performance/benchmark.ts

      - name: Generate statusline sample
        run: |
          ./dist/index.js init --defaults --no-install
          ls -lah ./.claude/statusline.sh
```

**實作步驟：**
1. 建立檔案並 commit
2. Push 到 GitHub
3. 觀察 Actions 執行
4. 修正任何失敗的測試

**驗證：**
- [ ] CI workflow 成功執行
- [ ] 所有 jobs 都 pass
- [ ] Build artifacts 正確生成

#### Task 2.2: 新增 Version 一致性檢查

**目標：** 防止版本號不一致的 PR 被合併

**新增檔案：** `.github/workflows/version-check.yml`

```yaml
name: Version Consistency Check

on:
  pull_request:
    paths:
      - 'package.json'
      - 'src/index.ts'
      - 'src/generators/bash-generator.ts'

jobs:
  check-versions:
    name: Check Version Consistency
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Extract and compare versions
        run: |
          echo "Checking version consistency..."

          # Extract versions
          PACKAGE_VERSION=$(grep '"version"' package.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
          INDEX_VERSION=$(grep "const VERSION = " src/index.ts | sed "s/.*VERSION = '\([^']*\)'.*/\1/")
          GENERATOR_VERSION=$(grep "const VERSION = " src/generators/bash-generator.ts | sed "s/.*VERSION = '\([^']*\)'.*/\1/")

          echo "📦 package.json:        $PACKAGE_VERSION"
          echo "📄 src/index.ts:        $INDEX_VERSION"
          echo "🔧 bash-generator.ts:   $GENERATOR_VERSION"

          # Compare
          if [ "$PACKAGE_VERSION" != "$INDEX_VERSION" ]; then
            echo "❌ Version mismatch: package.json ($PACKAGE_VERSION) != src/index.ts ($INDEX_VERSION)"
            exit 1
          fi

          if [ "$PACKAGE_VERSION" != "$GENERATOR_VERSION" ]; then
            echo "❌ Version mismatch: package.json ($PACKAGE_VERSION) != bash-generator.ts ($GENERATOR_VERSION)"
            exit 1
          fi

          echo "✅ All versions match: $PACKAGE_VERSION"
```

**測試步驟：**
1. 建立故意不一致的 PR
2. 驗證 check 失敗
3. 修正後驗證 pass

**驗證：**
- [ ] Version mismatch 時 check 失敗
- [ ] Version 一致時 check 通過
- [ ] 錯誤訊息清楚明確

#### Task 2.3: 優化 Claude Code Review Prompt

**目標：** 讓 Claude 針對 cc-statusline 的特定需求進行 review

**修改檔案：** `.github/workflows/claude-code-review.yml`

找到 `direct_prompt` 部分，替換為：

```yaml
direct_prompt: |
  You are reviewing a PR for **cc-statusline**, a CLI tool that generates custom statuslines for Claude Code.

  ## Project Context
  - TypeScript CLI tool using ESM modules
  - Generates bash scripts for terminal statuslines
  - Uses Commander.js, Inquirer.js, Chalk, Ora
  - Generated bash scripts must be POSIX-compliant

  ## Review Checklist

  ### 1. Version Consistency (CRITICAL)
  - [ ] If version changed, verify consistency across:
        - package.json
        - src/index.ts (VERSION constant)
        - src/generators/bash-generator.ts (VERSION constant)

  ### 2. Documentation
  - [ ] CHANGELOG.md updated for user-facing changes
  - [ ] README.md examples still accurate
  - [ ] CLAUDE.md updated if dev workflow changed

  ### 3. TypeScript Code Quality
  - [ ] ESM imports use .js extensions (e.g., `from './file.js'`)
  - [ ] Strict type checking (no `any` without justification)
  - [ ] 2-space indentation, no semicolons
  - [ ] Conventional commit message format

  ### 4. Bash Script Quality (if changes to src/generators/ or src/features/)
  - [ ] POSIX compliance (no bashisms)
  - [ ] Proper quote escaping in template strings
  - [ ] Graceful fallbacks for missing dependencies (jq, git, ccusage)
  - [ ] Error handling for edge cases

  ### 5. Testing & Performance
  - [ ] Are tests needed for this change?
  - [ ] Performance implications considered? (target: <500ms execution)
  - [ ] Breaking changes documented?

  ## Review Style
  - Be specific and actionable
  - Cite line numbers when suggesting changes
  - Explain the "why" behind suggestions
  - Acknowledge good practices
  - For first-time contributors, be extra welcoming

  ## Severity Levels
  Use these prefixes:
  - 🔴 BLOCKER: Must fix before merge
  - 🟡 SUGGESTION: Consider improving
  - 🟢 NITPICK: Optional style improvement
  - 💡 TIP: Educational comment
```

**驗證：**
- [ ] Claude 的 review 更加針對專案需求
- [ ] 能抓到 version 不一致
- [ ] 能識別 bash script 的問題

#### Task 2.4: 啟用 Claude 工具執行

**目標：** 讓 Claude 能執行 build 和 test commands

**修改檔案：** `.github/workflows/claude.yml`

在 `with:` 區塊中添加：

```yaml
# 允許 Claude 執行的指令
allowed_tools: |
  Bash(npm run build),
  Bash(npm run dev),
  Bash(npm ci),
  Bash(./dist/index.js --version),
  Bash(./dist/index.js init --defaults --no-install),
  Bash(./dist/index.js preview ./.claude/statusline.sh),
  Bash(npx tsx test/performance/benchmark.ts),
  Bash(./test/test-installation.sh)

# 專案特定指引
custom_instructions: |
  This is cc-statusline, a CLI tool for generating Claude Code statuslines.

  Key conventions:
  - Use ESM imports with .js extensions
  - 2-space indentation, no semicolons
  - Conventional commits (feat:, fix:, docs:, etc.)
  - Version updates need changes in 3 files
  - Always update CHANGELOG.md for user-facing changes

  Project structure:
  - src/cli/ - CLI commands and prompts
  - src/features/ - Feature implementations (git, usage, colors, icons)
  - src/generators/ - Script generators (bash)
  - src/utils/ - Utilities (installer, validator, tester)

  When asked to make changes:
  1. Read relevant files first
  2. Run `npm run build` after source changes
  3. Test with `./dist/index.js preview ./.claude/statusline.sh`
  4. Update CHANGELOG.md if needed
```

**測試：**
1. 在 PR 中請 Claude 執行 build: `@claude 請執行 npm run build 並確認成功`
2. 請 Claude 運行測試: `@claude 請執行 performance benchmark`

**驗證：**
- [ ] Claude 能成功執行允許的指令
- [ ] Claude 遵守 custom_instructions
- [ ] 指令輸出在 comment 中顯示

### 驗收標準

完成此階段後你應該能夠：
- [x] 建立完整的 CI pipeline
- [x] 實作專案特定的檢查
- [x] 優化 Claude 的 review 品質
- [x] 讓 Claude 執行測試和 build 指令

---

## 🚀 階段三：進階整合（5-6 天）

### 學習目標

1. 自動化 release 流程
2. 實作智能觸發條件
3. 優化 API 使用成本

### 實作任務

#### Task 3.1: Release 準備 Workflow

**目標：** 使用 Claude 協助準備 release

**新增檔案：** `.github/workflows/prepare-release.yml`

```yaml
name: Prepare Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'New version (e.g., 1.5.0)'
        required: true
        type: string
      release_type:
        description: 'Release type'
        required: true
        type: choice
        options:
          - patch
          - minor
          - major

jobs:
  prepare:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: read

    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # 需要完整 git history

      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Create release branch
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git checkout -b release/v${{ inputs.version }}

      - name: Update version numbers
        run: |
          VERSION="${{ inputs.version }}"

          # Update package.json
          sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" package.json

          # Update src/index.ts
          sed -i.bak "s/const VERSION = '.*'/const VERSION = '$VERSION'/" src/index.ts

          # Update src/generators/bash-generator.ts
          sed -i.bak "s/const VERSION = '.*'/const VERSION = '$VERSION'/" src/generators/bash-generator.ts

          rm *.bak

          git add package.json src/index.ts src/generators/bash-generator.ts
          git commit -m "chore: bump version to $VERSION"

      - name: Generate changelog with Claude
        uses: anthropics/claude-code-action@beta
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          direct_prompt: |
            Generate a CHANGELOG entry for version ${{ inputs.version }}.

            Review recent commits since the last release and create:
            1. A summary of changes grouped by category (Added, Changed, Fixed, etc.)
            2. Follow Keep a Changelog format
            3. Link to relevant PRs and issues

            Analyze the git history and update CHANGELOG.md with the new entry.
          allowed_tools: "Bash(git log),Bash(git show)"

      - name: Push branch and create PR
        run: |
          git push -u origin release/v${{ inputs.version }}

          gh pr create \
            --title "Release v${{ inputs.version }}" \
            --body "Release preparation for version ${{ inputs.version }}" \
            --label "release"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**使用方式：**
1. 前往 Actions tab
2. 選擇 "Prepare Release" workflow
3. 點擊 "Run workflow"
4. 輸入版本號
5. 等待 PR 建立

**驗證：**
- [ ] 能成功建立 release branch
- [ ] 版本號在 3 個檔案都更新
- [ ] Claude 生成合理的 CHANGELOG
- [ ] 自動建立 PR

#### Task 3.2: 智能觸發條件

**目標：** 只在必要時觸發 Claude review，節省 API credits

**修改檔案：** `.github/workflows/claude-code-review.yml`

在 `on:` 區塊後添加條件判斷：

```yaml
jobs:
  claude-review:
    # 跳過條件
    if: |
      !contains(github.event.pull_request.title, '[skip-review]') &&
      !contains(github.event.pull_request.title, 'WIP') &&
      !contains(github.event.pull_request.labels.*.name, 'dependencies')

    runs-on: ubuntu-latest
    # ... rest of the job
```

添加檔案過濾：

```yaml
on:
  pull_request:
    types: [opened, synchronize]
    paths:
      - 'src/**/*.ts'
      - 'src/**/*.js'
      - '.github/workflows/**'
      - 'package.json'
      - 'tsconfig.json'
```

**優化技巧：**
```yaml
# 使用 sticky comment 避免重複
use_sticky_comment: true

# 根據 PR 大小調整模型
model: |
  ${{
    github.event.pull_request.additions > 500 &&
    'claude-opus-4-1-20250805' ||
    'claude-sonnet-4-20250514'
  }}
```

**驗證：**
- [ ] 標題包含 [skip-review] 時不觸發
- [ ] 只修改 docs 時不觸發
- [ ] 大型 PR 使用 Opus
- [ ] Sticky comment 正常運作

#### Task 3.3: 監控與分析

**目標：** 追蹤 Claude review 的效果

**新增檔案：** `.github/workflows/review-metrics.yml`

```yaml
name: Review Metrics

on:
  schedule:
    - cron: '0 0 * * 0'  # 每週日午夜
  workflow_dispatch:

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Analyze review effectiveness
        uses: anthropics/claude-code-action@beta
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          github_token: ${{ secrets.GITHUB_TOKEN }}
          direct_prompt: |
            Analyze the effectiveness of automated code reviews over the past week:

            1. How many PRs were reviewed?
            2. What types of issues were caught?
            3. Were there any false positives?
            4. What improvements can be made to the review prompts?

            Create a summary issue with your findings.
```

**驗證：**
- [ ] 每週生成 metrics report
- [ ] 能識別 review 的價值
- [ ] 提供改進建議

### 驗收標準

完成此階段後你應該能夠：
- [x] 半自動化 release 流程
- [x] 智能控制 workflow 觸發
- [x] 優化 API 使用成本
- [x] 追蹤和改進 review 效果

---

## 🎓 階段四：探索與優化（7+ 天）

### 進階主題

#### 1. Multi-Agent Workflows

探索讓不同 Claude instances 處理不同任務：
- Review Agent: 專注 code review
- Test Agent: 執行測試並分析結果
- Documentation Agent: 更新文檔
- Release Agent: 處理 release 流程

#### 2. Custom Tools Integration

研究如何整合專案特定工具：
```yaml
allowed_tools: |
  Bash(custom-script.sh),
  Bash(project-specific-validator)
```

#### 3. Security Hardening

- 限制 allowed_tools 範圍
- 實作 workflow approval
- 定期 rotate secrets
- 監控異常活動

#### 4. Performance Optimization

- 使用 cache 加速 builds
- 並行執行獨立 jobs
- 優化 checkout depth
- 減少不必要的 workflow 觸發

### 實驗想法

記錄在 [GITHUB_ACTIONS_PROGRESS.md](./GITHUB_ACTIONS_PROGRESS.md) 中：
- 測試不同的 prompt 策略
- 比較 Sonnet vs Opus 的 review 品質
- 嘗試不同的觸發條件
- 探索 Claude 的極限

---

## 📖 學習資源

### 官方文檔
- [GitHub Actions 文檔](https://docs.github.com/en/actions)
- [Claude Code GitHub Actions](https://docs.claude.com/en/docs/claude-code/github-actions)
- [anthropics/claude-code-action](https://github.com/anthropics/claude-code-action)

### 範例專案
- 研究其他開源專案的 workflows
- 參考 Anthropic 官方範例

### 社群資源
- GitHub Actions Marketplace
- Claude Code Discord/Community

---

## 🎯 最終目標

完成此學習計劃後，你應該能夠：
1. ✅ 獨立設計和實作 GitHub Actions workflows
2. ✅ 有效整合 Claude Code 提升開發效率
3. ✅ 針對專案需求客製化 automation
4. ✅ 優化 API 使用成本
5. ✅ troubleshoot 常見問題
6. ✅ 分享經驗給其他開發者

---

**下一步：** 開始追蹤你的學習進度 → [GITHUB_ACTIONS_PROGRESS.md](./GITHUB_ACTIONS_PROGRESS.md)