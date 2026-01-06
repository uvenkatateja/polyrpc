# @polyrpc/client

Type-safe Python API client for TypeScript.

## Installation

```bash
npm install @polyrpc/client
```

## Usage

```typescript
import { createClient } from '@polyrpc/client';
import type { PolyRPCRoutes } from './polyrpc.d';

const py = createClient<PolyRPCRoutes>({
  baseUrl: 'http://localhost:8000',
});

// Fully typed!
const user = await py.users.get.query({ id: 1 });
```

## Documentation

See [polyrpc.dev](https://polyrpc.dev) for full documentation.

## License

MIT
