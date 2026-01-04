# Contributing to AI-Radio News Application

Thank you for your interest in contributing to AI-Radio! We welcome contributions from the community.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Submitting Changes](#submitting-changes)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/ai-radio.git
   cd ai-radio
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/ai-radio.git
   ```
4. **Set up the development environment** following the [README.md](README.md)

## Development Workflow

### 1. Create a Branch

Create a branch for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bugfix-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### 2. Make Your Changes

- Write clear, concise commit messages
- Follow the coding standards (see below)
- Add tests for new features
- Update documentation as needed

### 3. Test Your Changes

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Linting
npm run lint
```

### 4. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve issue with X"
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"
git commit -m "test: add tests for Y"
```

Commit message format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push Your Changes

```bash
git push origin feature/your-feature-name
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid using `any` unless absolutely necessary
- Use meaningful variable and function names

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Fix linting issues
npm run lint:fix
```

### Best Practices

**Backend:**
- Follow RESTful API design principles
- Use async/await instead of callbacks
- Implement proper error handling
- Add logging for important operations
- Write unit tests for business logic

**Frontend:**
- Use functional components with hooks
- Keep components small and focused
- Implement proper loading and error states
- Follow accessibility best practices
- Optimize for performance

## Submitting Changes

### Pull Request Process

1. **Update your branch** with the latest changes from upstream
2. **Push your changes** to your fork
3. **Create a Pull Request** on GitHub
4. **Fill out the PR template** completely
5. **Wait for review** from maintainers

### Pull Request Guidelines

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass
- Keep PRs focused and atomic (one feature/fix per PR)
- Update documentation as needed

### PR Title Format

Follow the same format as commit messages:

```
feat: add user authentication
fix: resolve memory leak in news fetcher
docs: update API documentation
```

### Code Review Process

- At least one maintainer approval is required
- Address all review comments
- Keep discussions professional and constructive
- Be open to feedback and suggestions

## Reporting Bugs

### Before Submitting a Bug Report

- Check if the bug has already been reported
- Try to reproduce the issue with the latest version
- Collect relevant information (logs, screenshots, etc.)

### Bug Report Template

When creating a bug report, include:

1. **Description** - Clear and concise description of the bug
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, browser, Node version, etc.
6. **Screenshots/Logs** - If applicable
7. **Additional Context** - Any other relevant information

## Feature Requests

We welcome feature requests! Before submitting:

1. **Check existing issues** to avoid duplicates
2. **Describe the feature** clearly and concisely
3. **Explain the use case** - Why is this feature needed?
4. **Provide examples** - How would it work?
5. **Consider alternatives** - Other ways to achieve the same goal

## Project Structure

```
ai-radio/
├── backend/          # Backend Node.js application
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── routes/
│   └── tests/
├── frontend/         # Frontend React application
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
└── docs/            # Documentation
```

## Questions?

If you have questions:

1. Check the [README.md](README.md) and [PROJECT_PLAN.md](PROJECT_PLAN.md)
2. Search existing GitHub issues
3. Create a new discussion on GitHub Discussions
4. Reach out to maintainers

## License

By contributing to AI-Radio, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to AI-Radio!** 🎉
