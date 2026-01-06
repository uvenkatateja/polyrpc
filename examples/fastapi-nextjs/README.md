# PolyRPC Example: FastAPI + Next.js

This example demonstrates the full PolyRPC workflow.

## Project Structure

```
├── backend/
│   └── main.py          # FastAPI server with Pydantic models
├── frontend/
│   └── src/
│       └── lib/
│           ├── polyrpc.d.ts  # Auto-generated types (by PolyRPC)
│           └── polyrpc.ts    # Client setup
└── polyrpc.toml         # PolyRPC configuration
```

## Quick Start

### 1. Start the Python Backend

```bash
cd backend
pip install fastapi uvicorn pydantic
uvicorn main:app --reload --port 8000
```

### 2. Start PolyRPC Watcher

```bash
# In project root
polyrpc watch
```

### 3. Start the Next.js Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

## The Magic

1. Edit `backend/main.py` - add a new field to `User`:
   ```python
   class User(BaseModel):
       # ... existing fields
       avatar_url: Optional[str] = None  # Add this!
   ```

2. Save the file (Ctrl+S)

3. PolyRPC instantly updates `frontend/src/lib/polyrpc.d.ts`

4. In your React component, `user.avatar_url` is now available with full autocomplete!

No manual code generation. No build steps. Just save and code.
