# PolyRPC VS Code Extension

Real-time Python to TypeScript type inference for VS Code.

## Features

- **Auto-start**: Automatically starts watching when `polyrpc.toml` is detected
- **Status bar**: Shows watching status with one-click toggle
- **Commands**: Start, stop, generate types, and initialize projects

## Requirements

- [PolyRPC CLI](https://www.npmjs.com/package/polyrpc) installed globally
- Or [polyrpc-sentinel](https://crates.io/crates/polyrpc-sentinel) Rust binary

## Installation

```bash
# Install the CLI
npm install -g polyrpc

# Or install the Rust binary
cargo install polyrpc-sentinel
```

## Commands

- `PolyRPC: Start Watching` - Start watching Python files
- `PolyRPC: Stop Watching` - Stop watching
- `PolyRPC: Generate Types` - Generate types once
- `PolyRPC: Initialize Project` - Create polyrpc.toml

## Settings

- `polyrpc.autoStart`: Automatically start watching (default: true)
- `polyrpc.binaryPath`: Custom path to polyrpc binary

## Usage

1. Open a project with `polyrpc.toml`
2. The extension auto-starts watching
3. Edit Python files - TypeScript types update instantly
4. Click the status bar to toggle watching

## License

MIT
