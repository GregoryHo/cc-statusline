# Contributing to cc-statusline

Thank you for your interest in contributing to cc-statusline! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/cc-statusline.git
   cd cc-statusline
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Build the project**:
   ```bash
   npm run build
   ```
5. **Test your changes**:
   ```bash
   ./dist/index.js --help
   npx . init --no-install  # Test locally
   ```

## 🛠️ Development Workflow

### Issue-Driven Development (Recommended)

We follow an issue-first workflow for all contributions:

1. **Start with an Issue**
   - Create a new issue or pick an existing one
   - Discuss your approach in the issue comments
   - Get feedback before starting implementation

2. **Create a Feature Branch**
   - **Never commit directly to main**
   - Use descriptive branch names:
     - `feat/feature-name` - New features
     - `fix/bug-description` - Bug fixes
     - `test/what-tested` - Test additions
     - `docs/what-changed` - Documentation
     - `refactor/what-refactored` - Code refactoring

3. **Develop with Tests**
   - Write tests first when possible (TDD)
   - Run tests: `npm run test:run`
   - Build project: `npm run build`
   - Ensure all tests pass

4. **Commit with Issue Reference**
   - Format: `type: description (#issue-number)`
   - Example: `feat: add unit testing framework (#4)`
   - Use conventional commits (see below)

5. **Create Pull Request**
   - Push your branch: `git push -u origin feat/your-feature`
   - Create PR on GitHub
   - Use "Closes #N" in PR description to auto-close issue
   - Ensure CI pipeline passes

6. **Address Review Feedback**
   - Respond to comments
   - Make requested changes
   - Push updates to same branch

### Making Changes (Quick Reference)

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm run build
   ./dist/index.js preview path/to/statusline.sh
   ```

4. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

### Commit Message Format

We follow [Conventional Commits](https://conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add support for Python runtime
fix: resolve preview timeout issue
docs: update README installation guide
```

## 🎯 Types of Contributions

### 🐛 Bug Reports
- Use GitHub Issues with the bug template
- Include steps to reproduce
- Provide sample statusline.sh if relevant
- Include OS and Node.js version

### ✨ Feature Requests
- Use GitHub Issues with the feature template
- Explain the use case
- Consider implementation complexity
- Check if it fits the "dead simple" philosophy

### 🔧 Code Contributions
- **New Features**: Discuss in an issue first
- **Bug Fixes**: Can be submitted directly
- **Documentation**: Always welcome!

## 📋 Code Standards

### TypeScript
- **Strict typing** - All functions must have type hints
- **ESM modules** - Use import/export syntax
- **Error handling** - Always handle errors gracefully

### Code Style
- **2 spaces** for indentation
- **No semicolons** (follows project style)
- **Descriptive names** - Functions and variables should be self-documenting
- **Comments** - Only when necessary to explain "why", not "what"

### File Structure
```
src/
├── cli/           # CLI commands and prompts
├── features/      # Feature-specific code (git, usage, colors)
├── generators/    # Script generators (bash, etc.)
└── utils/         # Utilities (installer, validator, tester)
```

## 🧪 Testing

### Manual Testing
```bash
# Build and test CLI
npm run build
./dist/index.js init --output ./test-statusline.sh --no-install

# Test preview functionality
./dist/index.js preview ./test-statusline.sh

# Test with different configurations
# (Change features in prompts.ts and rebuild)
```

### Adding Tests
- Test new features in `src/utils/tester.ts`
- Ensure backwards compatibility
- Test error conditions

## 📚 Documentation

### README Updates
- Keep examples current
- Update command usage if changed
- Maintain consistent formatting

### Code Documentation
- Update JSDoc comments for new functions
- Include parameter and return types
- Provide usage examples for complex functions

## 🚢 Pull Request Process

1. **Update documentation** if needed
2. **Test your changes** thoroughly
3. **Update CHANGELOG.md** following Keep a Changelog format
4. **Submit pull request** with clear description
5. **Address review feedback** promptly

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
- [ ] Tested locally
- [ ] Updated tests if needed
- [ ] Documentation updated

## Checklist
- [ ] Follows code style
- [ ] Self-review completed
- [ ] CHANGELOG.md updated
```

## 🤝 Community Guidelines

### Be Respectful
- Use welcoming and inclusive language
- Respect different viewpoints and experiences
- Focus on constructive feedback

### Be Helpful
- Help newcomers get started
- Share knowledge and best practices
- Collaborate openly

### Keep It Simple
- Follow the "dead simple" philosophy
- Avoid over-engineering
- Prioritize user experience

## 🏆 Recognition

Contributors will be:
- Listed in CHANGELOG.md for their contributions
- Mentioned in release notes for significant features
- Welcomed into the community with appreciation

## ❓ Questions?

- **GitHub Issues** - For bugs and feature requests
- **GitHub Discussions** - For questions and ideas
- **Email** - chong-u@aioriented.dev for private matters

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for helping make cc-statusline better!** 🚀