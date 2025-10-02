# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2025-10-01

### Changed
- ⬆️ **Dependency Upgrades** - All dependencies updated to latest stable versions
  - commander: 11.1.0 → 14.0.1 (CLI framework)
  - inquirer: 9.3.7 → 12.9.6 (interactive prompts)
  - ora: 7.0.1 → 9.0.0 (loading spinners)
  - chalk: 5.5.0 → 5.6.2 (terminal colors)
  - typescript: 5.9.2 → 5.9.3 (compiler)
  - @types/node: 20.19.10 → 24.6.1 (Node.js types)
  - @types/inquirer: 9.0.7 → 9.0.9 (inquirer types)

### Added
- ✨ **TypeScript Declarations** - Enabled type declarations for better developer experience
  - Generated `.d.ts` files for type-safe imports
  - Resolved inquirer type issues that blocked declarations
  - Future consumers can now import with full type safety

### Fixed
- 🔒 **Security** - All npm audit vulnerabilities resolved (0 vulnerabilities)
- 🐛 **Compatibility** - No breaking changes, fully backward compatible

## [1.5.0] - 2025-09-30

### Added
- ✨ **Unit Testing Framework** - Comprehensive Vitest testing infrastructure
  - 39 tests covering bash-generator and validator modules
  - Test scripts: `npm test`, `npm run test:coverage`, `npm run test:ui`
  - CI/CD integration with automated testing
  - Coverage baseline: 27.56% overall (bash-generator: 88%, validator: 100%)
  - Coverage thresholds established (25-50%) to prevent regression

### Fixed
- 🐛 **Icon System** - Fixed missing 'none' icon style option
  - Added `noIcons` IconSet for text-only output
  - Changed default icon style from nerd-font to emoji for better compatibility

## [1.4.0] - 2025-09-30

### Added
- ✨ **Icon System** - Nerd Font support with customizable icon styles (emoji/nerd-font/none)
  - Beautiful icons for directory (󰉋), git (󰊢), model (󱤇), context (󰾶), session (󱎫), cost (󰈙), tokens (󱪙)
  - Graceful fallback to emoji when Nerd Fonts not available
  - Icon style selection during interactive setup
- ✨ **Non-Interactive Mode** - `--defaults` flag for automated setup
  - Perfect for CI/CD pipelines and scripting
  - Uses sensible defaults (all features enabled, nerd-font icons, colors on)
  - Example: `cc-statusline init --defaults`
- ✨ **Comma Formatting** - Large numbers now display with thousand separators
  - Token counts: "1,234,567 tokens" instead of "1234567 tokens"
  - Burn rate: "135,957 tpm" for better readability
- ✨ **Performance Testing Suite** - Comprehensive benchmarking tools
  - TypeScript-based benchmark suite (`test/performance/benchmark.ts`)
  - Bash stress testing (`test/performance/stress-test.sh`)
  - Real-time system monitoring (`test/performance/monitor.ts`)
  - See `test/performance/PERFORMANCE.md` for detailed guide

### Changed
- 🎨 **Color Harmony Improvements** - Enhanced visual consistency
  - Token/usage color changed from purple (141) to deep sky blue (111)
  - Better color coordination across all statusline elements
  - More cohesive visual experience in Claude Code terminal
- 🎨 **Icon Consistency** - All features now have color-coordinated icons
  - Directory, git, model, version, output style, Claude Code version icons
  - Consistent visual language throughout statusline

### Fixed
- 🐛 **Session Time Calculation** - Fixed incorrect "0h 0m until reset (100%)" display
  - Added millisecond handling in ISO 8601 timestamp parsing
  - `to_epoch()` function now strips `.000Z` before parsing
  - Session time and progress bars now display correctly
- 🐛 **Context Display** - Improved fallback for unavailable context data
  - Shows "100% remaining" instead of "TBD" when context unavailable
  - Better user experience for non-active sessions
- 🐛 **HAS_JQ Detection** - Fixed context remaining display issues
  - Separated jq availability detection from context calculation
  - Context features now work reliably with or without jq
- 🐛 **Icon System Implementation** - Corrected icon selection logic
  - Set nerd-font as default icon style for better visual experience
  - Fixed icon rendering in generated statusline scripts

## [1.3.2] - 2025-08-28

### Fixed
- 🪟 **Windows Bash Compatibility** - Fixed JSON extraction in bash fallback mode for Windows Git Bash/MinGW
  - Improved nested JSON field extraction for `workspace.current_dir` and `model.display_name`
  - Added Windows path conversion from backslashes to forward slashes
  - Fixed cost data extraction without jq
  - Generator now uses `bash .claude/statusline.sh` command in settings.json for Windows

## [1.3.1] - 2025-08-28

### Fixed
- 🐛 **Critical: Bash JSON Fallback Parser** - Fixed syntax error in fallback JSON parser for systems without jq
  - Fixed malformed grep patterns with incorrect quote escaping in `bash-generator.ts`
  - Statusline now works correctly on systems without jq installed
  - Properly escapes quotes in generated bash script (`\"${field}\"` instead of `"${field}"`)

### Added
- ✨ **jq Detection and Installation Guide** - Added automatic jq detection during init
  - Checks if jq is installed and warns about limited functionality without it
  - Provides platform-specific installation instructions (macOS, Linux, Windows)
  - Asks users if they want to continue without jq
  - Clear documentation in README about which features require jq

### Changed
- 📚 **Enhanced Windows Documentation** - Clarified jq installation for Windows users
  - Specific file names for download (`jq-windows-amd64.exe` for 64-bit)
  - Step-by-step PATH configuration instructions
  - Clear options between package managers and manual installation

## [1.3.0] - 2025-08-28

### Changed
- 🔥 **Cost Burn Rate Calculation** - Now calculates burn rate ($/hour) directly from Claude Code's cost and duration data
  - No longer relies on ccusage for burn rate calculation
  - Uses `cost.total_cost_usd` and `cost.total_duration_ms` from Claude Code's input
  - More accurate and reliable burn rate display
- 📁 **Project-Relative Logging** - Statusline logs are now created relative to where the statusline script is installed
  - Logs go to `.claude/statusline.log` in the project directory when installed locally
  - Previously always logged to `~/.claude/statusline.log` regardless of installation location
### Fixed
- 🐛 Fixed version drift between CLI and package.json
- 🐛 Fixed logging directory to respect project-level installations

### Added
- ✨ Version number now included in generated statusline headers (e.g., `# Generated by cc-statusline v1.3.0`)

## [1.2.7] - 2025-08-28

### Fixed
- 🐛 **ccusage Integration Fix** - Fixed ccusage stats not displaying in statusline
  - Moved `input=$(cat)` before logging to ensure proper input capture
  - Simplified ccusage execution by removing complex locking mechanism
  - Now properly calls `ccusage blocks --json` directly with internal caching
  - Fixed cost display, burn rate, token stats, and session time display

## [1.2.6] - 2025-08-27

### Fixed
- 🐛 **Installation Prompt Fix** - Fixed spinner blocking the overwrite confirmation prompt during installation
  - Removed ora spinner during installation phase to ensure prompts are visible
  - Replaced spinner with simple console messages for better UX
  - Users can now properly see and respond to overwrite confirmations

## [1.2.5] - 2025-08-27

### Fixed
- 🐛 **Cost Display Fix** - Fixed incorrect cost values (e.g., $48.00) caused by improper quoting in printf statements
  - Removed unnecessary escaped quotes around `$cost_usd` in bash generator
  - Cost values now display correctly with proper decimal formatting

## [1.2.4] - 2025-08-26

### Added
- 🆕 **Installation Location Choice** - Choose between global (`~/.claude`) or project-level (`./.claude`) installation
- 🔒 **Safe Installation** - Confirmation prompts before overwriting existing statusline.sh files
- 🛡️ **Settings Protection** - Smart settings.json updates that preserve existing configurations
- ⚠️ **Conflict Detection** - Warns when other statuslines are already configured
- ✅ **Better Error Handling** - Clear messages for cancelled installations and conflicts

### Changed
- Installation prompt now includes location selection (global vs project)
- Default installation is project-level for safety
- Improved settings.json update logic to prevent accidental overwrites

## [1.2.3] - 2025-08-20

### Fixed
- 🔒 **Critical Process Spawning Fix** - Added file-based locking mechanism to prevent infinite ccusage process spawning
- ⚡ **Performance** - Implemented 3-second timeout for ccusage calls to prevent hanging
- 🛡️ **Stability** - Added PID tracking for stale lock detection and cleanup
- 🔧 **Cross-platform** - Multiple timeout strategies for Linux, macOS, and BSD compatibility

### Contributors
- 🙏 **Special thanks to [Jonathan Borgwing (@DevVig)](https://github.com/DevVig)** for identifying and implementing the critical process spawning fix ([#4](https://github.com/chongdashu/cc-statusline/pull/4))

### Technical Details
- **File-based locking**: Uses `/tmp/ccusage_statusline.lock` directory as a mutex to ensure single execution
- **PID tracking**: Stores process ID in `/tmp/ccusage_statusline.pid` for stale lock detection  
- **Graceful degradation**: Skips execution when locked instead of queuing (prevents pile-up)
- **Automatic cleanup**: Detects and removes stale locks from crashed processes using `kill -0`
- **Cross-platform timeouts**: Multiple timeout strategies (timeout/gtimeout/fallback) for all systems
- **Testing included**: Comprehensive test suite in `test/` directory to verify locking behavior

## [1.0.1] - 2025-08-13

### Added
- CONTRIBUTING.md with comprehensive contribution guidelines
- Development workflow documentation
- Code standards and testing guidelines

### Changed
- Updated package name to unscoped `cc-statusline`
- Enhanced README contributing section with better guidance

## [1.0.0] - 2025-08-13

### Added
- Initial release of cc-statusline
- Interactive configuration wizard with 2 simple prompts
- Bash script generation with optimized performance
- Real-time ccusage integration for usage statistics
- Preview mode for testing statusline scripts with mock data
- Auto-installation with settings.json configuration
- Support for directory, git, model, usage, session, token, and burn rate features
- TTY-aware color support with NO_COLOR environment variable respect
- Manual configuration instructions when auto-update fails
- Comprehensive documentation and examples
- Performance analysis and validation in preview mode
- Timestamp and npm URL in generated script headers

### Features
- 📁 Working Directory display with `~` abbreviation
- 🌿 Git Branch integration
- 🤖 Model Name & Version display
- 💵 Real-time Usage & Cost tracking
- ⌛ Session Time Remaining with progress bars
- 📊 Token Statistics (optional)
- ⚡ Burn Rate monitoring (optional)

### Technical
- TypeScript with strict type checking
- ESM module support
- Commander.js for CLI interface
- Inquirer.js for interactive prompts
- Chalk for colorized output
- Ora for loading spinners
- Comprehensive error handling and validation
- Modular architecture for easy maintenance

[1.0.0]: https://github.com/chongdashu/cc-statusline/releases/tag/v1.0.0