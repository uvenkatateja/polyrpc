# @polyrpc/react

React Query integration for PolyRPC.

## Installation

```bash
npm install @polyrpc/react @tanstack/react-query
```

## Usage

```tsx
import { createPolyRPC } from '@polyrpc/react';
import type { PolyRPCRoutes } from './polyrpc.d';

const { py, PolyRPCProvider } = createPolyRPC<PolyRPCRoutes>({
  baseUrl: 'http://localhost:8000',
});

// In your component
function UserProfile({ userId }) {
  const { data, isLoading } = py.users.get.useQuery({ id: userId });
  
  if (isLoading) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

## Documentation

See [polyrpc.dev](https://polyrpc.dev) for full documentation.

## License

MIT
