# PolyRPC

> The Invisible Bridge between Python Backends and TypeScript Frontends.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/uvenkatateja/polyrpc/actions/workflows/ci.yml/badge.svg)](https://github.com/uvenkatateja/polyrpc/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/docs-polyrpc.vercel.app-blue)](https://polyrpc.vercel.app)

PolyRPC provides **real-time type inference** from Python (FastAPI/Pydantic) to TypeScript, giving you the "tRPC experience" without abandoning Python.

**[📚 Documentation](https://polyrpc.vercel.app)** | **[🚀 Getting Started](https://polyrpc.vercel.app/docs/getting-started)** | **[💡 Examples](./examples)**

## The Problem

In 2026, the world is split between **Python** (AI/ML, FastAPI) and **TypeScript** (React, Next.js). Connecting them is painful:

- **Manual**: Write Python model → Write TypeScript interface → Human error, out-of-sync bugs
- **Code Gen**: Write Python → Run `npm run generate` → Wait 5 seconds → Restart → Flow broken
- **tRPC**: Magic! But... TypeScript-only backend

## The Solution

PolyRPC gives you tRPC-like magic while keeping your Python backend:

```
You save server.py → Rust parses AST in <50ms → TypeScript types update → VS Code autocomplete works
```

**No commands. No build steps. Just save and code.**

## Quick Start

**[📖 Full Documentation](https://polyrpc.vercel.app/docs/getting-started)**

```bash
# Install CLI
npm install -g polyrpc

# Initialize in your project
polyrpc init

# Start watching (runs in background)
polyrpc watch
```

In your React code:

```tsx
import { py } from '@polyrpc/react';

// Full autocomplete from your Python models!
const { data } = py.users.get.useQuery({ id: 1 });
console.log(data.name); // TypeScript knows this is a string!
```

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| `polyrpc` | CLI + Rust sentinel binary | `npm i -g polyrpc` |
| `@polyrpc/client` | Lightweight fetch wrapper with Proxy magic | `npm i @polyrpc/client` |
| `@polyrpc/react` | React Query integration | `npm i @polyrpc/react` |

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Python Files   │────▶│  Rust Sentinel   │────▶│  TypeScript     │
│  (Pydantic)     │     │  (tree-sitter)   │     │  Definitions    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
   You save file          <50ms parse              VS Code sees
   (Ctrl+S)               No Python runtime        new types instantly
```

### Architecture

1. **Sentinel** (Rust): File watcher + Python AST parser using tree-sitter
2. **Generator**: Converts Python types to TypeScript interfaces
3. **Client**: Proxy-based fetch wrapper for type-safe API calls
4. **React**: TanStack Query integration with hooks

## Type Mapping

| Python | TypeScript |
|--------|------------|
| `str` | `string` |
| `int`, `float` | `number` |
| `bool` | `boolean` |
| `List[T]` | `T[]` |
| `Dict[K, V]` | `Record<K, V>` |
| `Optional[T]` | `T \| null` |
| `Union[A, B]` | `A \| B` |
| `Literal["a", "b"]` | `"a" \| "b"` |

## Project Structure

```
polyrpc/
├── crates/
│   └── sentinel/        # Rust: File watcher + Python parser
├── packages/
│   ├── cli/             # npm: CLI wrapper for Rust binary
│   ├── client/          # npm: @polyrpc/client
│   └── react/           # npm: @polyrpc/react
└── examples/
    └── fastapi-nextjs/  # Full working example
```

## Development

```bash
# Clone the repo
git clone https://github.com/uvenkatateja/polyrpc
cd polyrpc

# Install dependencies
pnpm install

# Build Rust binary
cd crates/sentinel
cargo build --release

# Build npm packages
pnpm build

# Run example
cd examples/fastapi-nextjs
# See examples/fastapi-nextjs/README.md for details
```

**[📖 Contributing Guide](./CONTRIBUTING.md)**

## Why Rust?

Python parsing Python is slow. We need <50ms response times to feel "instant". Rust + tree-sitter gives us:

- **Speed**: Parse entire codebase in milliseconds
- **No Runtime**: Static analysis, no Python interpreter needed
- **Incremental**: Only re-parse changed files
- **Cross-platform**: Single binary for Windows/Mac/Linux

## Roadmap

- [x] Pydantic model parsing
- [x] Basic type mapping
- [x] File watcher with debouncing
- [x] TypeScript interface generation
- [x] React Query integration
- [x] FastAPI route extraction
- [x] Enum support
- [x] Generic types
- [x] VS Code extension
- [x] Electron support

## License

MIT
