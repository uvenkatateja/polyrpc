import { InstallTabs } from '@/components/InstallTabs';

export default function GettingStartedPage() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Getting Started</h1>
      <p className="lead">Get PolyRPC running in under 5 minutes.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 18+</li>
        <li>Python 3.9+ with FastAPI/Pydantic</li>
        <li>A Next.js or React project</li>
      </ul>

      <h2>Installation</h2>

      <h3>1. Install the CLI</h3>
      <InstallTabs packages="-g polyrpc" />

      <h3>2. Initialize in your project</h3>
      <div className="bg-zinc-900 rounded-lg p-4 my-4">
        <code className="text-sm text-gray-100">
          <span className="text-gray-500">$</span> cd your-project<br />
          <span className="text-gray-500">$</span> polyrpc init
        </code>
      </div>

      <p>This creates a <code>polyrpc.toml</code> config file:</p>
      <pre className="bg-zinc-900 rounded-lg p-4">
        <code>{`[python]
source_dir = "backend"

[typescript]
output_file = "frontend/src/lib/polyrpc.d.ts"

[api]
base_url = "/api"`}</code>
      </pre>

      <h3>3. Install the client packages</h3>
      <InstallTabs packages="@polyrpc/client @polyrpc/react @tanstack/react-query" />

      <h3>4. Start the watcher</h3>
      <div className="bg-zinc-900 rounded-lg p-4 my-4">
        <code className="text-sm text-gray-100">
          <span className="text-gray-500">$</span> polyrpc watch
        </code>
      </div>

      <p>You'll see:</p>
      <div className="bg-zinc-900 rounded-lg p-4 my-4">
        <code className="text-sm">
          <span className="text-yellow-400">⚡ PolyRPC Sentinel</span><br />
          <span className="text-gray-400">👁 Watching backend → frontend/src/lib/polyrpc.d.ts</span><br />
          <span className="text-gray-400">→ Watching for changes... (Ctrl+C to stop)</span>
        </code>
      </div>

      <h2>Your First Type-Safe API Call</h2>

      <h3>Python Backend</h3>
      <pre className="bg-zinc-900 rounded-lg p-4">
        <code className="language-python">{`from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    id: int
    name: str
    email: str

@app.get("/users/{user_id}")
async def get_user(user_id: int) -> User:
    return User(id=user_id, name="Alice", email="alice@example.com")`}</code>
      </pre>

      <h3>React Frontend</h3>
      <pre className="bg-zinc-900 rounded-lg p-4">
        <code className="language-tsx">{`'use client';

import { py } from '@/lib/polyrpc';

export default function Page() {
  // Full type inference from Python!
  const { data, isLoading } = py.users.get_user.useQuery({ user_id: 1 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.email}</p>
    </div>
  );
}`}</code>
      </pre>

      <h2>Next Steps</h2>
      <ul>
        <li><a href="/docs/concepts">Concepts</a> - Understand how PolyRPC works</li>
        <li><a href="/docs/client">Client Usage</a> - Learn the client API</li>
        <li><a href="/docs/react">React Integration</a> - React Query hooks</li>
        <li><a href="/docs/examples">Examples</a> - Full working examples</li>
      </ul>
    </div>
  );
}
