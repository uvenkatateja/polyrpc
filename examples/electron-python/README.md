# PolyRPC + Electron + Python Example

This example shows how to use PolyRPC with Electron and a local Python backend.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron App                          │
│  ┌─────────────────┐         ┌─────────────────────┐   │
│  │   Main Process  │         │   Renderer Process  │   │
│  │   (Node.js)     │◄───────►│   (React + TS)      │   │
│  │                 │   IPC   │                     │   │
│  │   Spawns Python │         │   Uses PolyRPC      │   │
│  │   subprocess    │         │   generated types   │   │
│  └────────┬────────┘         └─────────────────────┘   │
│           │                                             │
│           ▼                                             │
│  ┌─────────────────┐                                   │
│  │  Python Backend │                                   │
│  │  (FastAPI/Flask)│                                   │
│  │  localhost:8000 │                                   │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```

## Setup

### 1. Install dependencies

```bash
# Frontend (Electron + React)
cd frontend
npm install

# Python backend
cd ../backend
pip install -r requirements.txt
```

### 2. Generate types

```bash
# From project root
polyrpc generate
```

### 3. Run the app

```bash
# Start Python backend (in one terminal)
cd backend
python main.py

# Start Electron app (in another terminal)
cd frontend
npm run dev
```

## Project Structure

```
electron-python/
├── backend/
│   ├── main.py           # FastAPI server
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── main/         # Electron main process
│   │   ├── renderer/     # React app
│   │   └── lib/
│   │       └── polyrpc.d.ts  # Generated types
│   └── package.json
└── polyrpc.toml
```

## How It Works

1. **Python Backend**: Runs as a subprocess spawned by Electron main process
2. **PolyRPC**: Watches Python files and generates TypeScript types
3. **Renderer**: Uses generated types for type-safe API calls
4. **IPC**: Main process can communicate with renderer for Python process management

## Use Cases

- **Local AI Apps**: Run PyTorch/TensorFlow models locally with a React UI
- **Desktop Tools**: Build desktop apps with Python logic and modern UI
- **Offline Apps**: No internet required, everything runs locally

## Tips

- Use `contextBridge` for secure IPC between main and renderer
- Spawn Python with `child_process.spawn` for better control
- Consider using `python-shell` npm package for easier Python integration
