# Contributing to Sistem-Agent

Thank you for your interest in contributing! Every contribution matters.

## Ways to Contribute

- **Bug reports** — open an issue with steps to reproduce
- **Feature requests** — open an issue describing the use case
- **Code** — fix a bug or implement a feature
- **Documentation** — improve clarity, fix typos
- **Tests** — add test coverage

## Development Setup

### Prerequisites

- Docker + Docker Compose
- Node.js 20+
- Git

### Local Setup

```bash
git clone https://github.com/Jailtonfonseca/sistem-agent.git
cd sistem-agent
cp .env.example .env

# Install dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Start dev servers
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

### Project Structure

```
backend/src/
  routes/     REST API endpoints
  socket/     WebSocket event handlers
  lib/        Shared utilities (Docker client)
  middleware/ Express middleware

frontend/src/
  app/        Next.js App Router
  components/ React components
```

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add container creation wizard
fix: resolve WebSocket reconnection on page refresh
docs: update API reference table
chore: upgrade dockerode to v4
```

## Pull Request Process

1. Fork the repo and create a feature branch from `main`
2. Make your changes and ensure they work locally
3. Commit using conventional commits
4. Open a PR with a clear description of what and why
5. Wait for review — we aim to respond within 48 hours

## Code Style

- TypeScript strict mode enabled — no `any` types
- Functional React components only
- No commented-out code in PRs

## Reporting Security Issues

Do **not** open a public issue for security vulnerabilities. Email directly: jailton@example.com

---

Thank you for making Sistem-Agent better!
