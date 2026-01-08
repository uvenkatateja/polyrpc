# PolyRPC

The invisible bridge between Python and TypeScript. Get tRPC-like type safety without abandoning Python.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/polyrpc.svg)](https://www.npmjs.com/package/polyrpc)
[![crates.io](https://img.shields.io/crates/v/polyrpc-sentinel.svg)](https://crates.io/crates/polyrpc-sentinel)

## What is PolyRPC?

PolyRPC watches your Python files and generates TypeScript types in real-time. Save your FastAPI code, get instant autocomplete in your React app.

```
Python (FastAPI/Pydantic) → Rust Parser (<50ms) → TypeScript Types
```

## Install

```bash
npm install -g polyrpc
```

## Usage

```bash
polyrpc init     # Create config file
polyrpc watch    # Watch and generate types
polyrpc generate # One-time generation
```

## Example

Python:
```python
class User(BaseModel):
    id: int
    name: str
    email: str

@app.get("/users/{user_id}")
def get_user(user_id: int) -> User:
    return users[user_id]
```

Generated TypeScript:
```typescript
export interface User {
  id: number;
  name: string;
  email: string;
}

export const py = {
  users: {
    get_user: {
      query: (input: { user_id: number }) => request<User>('GET', `/users/${input.user_id}`),
    },
  },
} as const;
```

Usage:
```typescript
const user = await py.users.get_user.query({ user_id: 1 });
// Full autocomplete, type-safe
```

## Features

- Real-time type generation (<50ms)
- Zero build steps
- Query parameters support
- SSE/Streaming for AI apps
- Enums, unions, optionals
- Path parameters

## Config

Create `polyrpc.toml`:

```toml
[python]
source_dir = "./backend"

[typescript]
output_file = "./frontend/src/polyrpc.ts"

[api]
base_url = "http://localhost:8000"
```

## Packages

| Package | Install |
|---------|---------|
| CLI | `npm i -g polyrpc` |
| Rust Core | `cargo install polyrpc-sentinel` |
| React Hooks | `npm i @polyrpc/react` |

## Docs

https://polyrpc.vercel.app

## License

MIT
