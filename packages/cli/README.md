# polyrpc

The invisible bridge between Python and TypeScript.

Real-time type generation from Python (FastAPI/Pydantic) to TypeScript in <100ms.

## Installation

```bash
npm install -g polyrpc
```

## Usage

```bash
# Initialize in your project
polyrpc init

# Watch for changes (real-time type generation)
polyrpc watch

# Generate types once
polyrpc generate
```

## How It Works

1. You save a Python file with Pydantic models
2. PolyRPC parses the AST in <100ms (Rust-powered)
3. TypeScript definitions are generated instantly
4. VS Code autocomplete works immediately

## Documentation

See [polyrpc.dev](https://polyrpc.dev) for full documentation.

## License

MIT
