# Contributing to PolyRPC

Thanks for your interest in contributing! 🎉

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust 1.70+
- Python 3.9+ (for testing)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/polyrpc.git
cd polyrpc

# Install dependencies
pnpm install

# Build Rust binary
cd crates/sentinel
cargo build --release

# Build npm packages
cd ../..
pnpm build
```

### Project Structure

```
polyrpc/
├── crates/sentinel/     # Rust: File watcher + Python parser
├── packages/
│   ├── cli/             # npm: CLI wrapper
│   ├── client/          # npm: @polyrpc/client
│   └── react/           # npm: @polyrpc/react
├── examples/            # Example projects
└── www/                 # Documentation (coming soon)
```

### Running Tests

```bash
# Rust tests
cd crates/sentinel && cargo test

# npm package tests
pnpm test
```

### Making Changes

1. Fork the repo
2. Create a branch: `git checkout -b my-feature`
3. Make your changes
4. Run tests: `pnpm test && cargo test`
5. Commit: `git commit -m "feat: add feature"`
6. Push: `git push origin my-feature`
7. Open a PR

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `chore:` Maintenance
- `refactor:` Code refactoring

## Questions?

Open an issue or reach out on Discord!
