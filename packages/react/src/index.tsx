/**
 * PolyRPC React Integration
 *
 * Provides React Query hooks for type-safe Python API calls.
 *
 * @example
 * ```tsx
 * import { createPolyRPC } from '@polyrpc/react';
 *
 * const { py, PolyRPCProvider } = createPolyRPC({ baseUrl: '/api' });
 *
 * // In your component:
 * const { data, isLoading } = py.users.get.useQuery({ id: 1 });
 * ```
 */

import {
  createClient,
  ClientConfig,
  PolyRPCError,
  QueryOptions,
  MutationOptions,
} from '@polyrpc/client';
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
  UseQueryOptions,
  UseMutationOptions,
  QueryKey,
} from '@tanstack/react-query';
import { createContext, useContext, ReactNode, useMemo } from 'react';

// ============ Types ============

export interface PolyRPCReactConfig extends ClientConfig {
  /** Custom QueryClient instance */
  queryClient?: QueryClient;
}

interface RouteHooks<TInput, TOutput> {
  /** Execute a query (GET) with React Query */
  useQuery: (
    input?: TInput,
    options?: Omit<UseQueryOptions<TOutput, PolyRPCError>, 'queryKey' | 'queryFn'>
  ) => ReturnType<typeof useQuery<TOutput, PolyRPCError>>;

  /** Execute a mutation (POST/PUT/DELETE) with React Query */
  useMutation: (
    options?: Omit<UseMutationOptions<TOutput, PolyRPCError, TInput>, 'mutationFn'>
  ) => ReturnType<typeof useMutation<TOutput, PolyRPCError, TInput>>;

  /** Get the query key for this route (useful for invalidation) */
  getQueryKey: (input?: TInput) => QueryKey;

  /** Prefetch data for this route */
  prefetch: (input?: TInput) => Promise<void>;

  /** Invalidate queries for this route */
  invalidate: (input?: TInput) => Promise<void>;

  /** Direct query call (no hooks) */
  query: (input?: TInput, options?: QueryOptions) => Promise<TOutput>;

  /** Direct mutation call (no hooks) */
  mutate: (input?: TInput, options?: MutationOptions) => Promise<TOutput>;
}

type ProxyTarget = {
  __path: string[]; 
  __config: Required<PolyRPCReactConfig>;
  __client: ReturnType<typeof createClient>;
};

// ============ Context ============

const PolyRPCContext = createContext<{
  config: Required<PolyRPCReactConfig>;
  queryClient: QueryClient;
} | null>(null);

function usePolyRPCContext() {
  const context = useContext(PolyRPCContext);
  if (!context) {
    throw new Error('usePolyRPC must be used within a PolyRPCProvider');
  }
  return context;
}

// ============ Implementation ============

const DEFAULT_CONFIG: Required<PolyRPCReactConfig> = {
  baseUrl: '/api',
  fetch: globalThis.fetch,
  headers: {},
  timeout: 30000,
  onRequest: (req) => req,
  onResponse: (_, data) => data,
  onError: () => {},
  queryClient: undefined as unknown as QueryClient,
};

/**
 * Create a PolyRPC React client with hooks
 */
export function createPolyRPC<TRoutes = Record<string, unknown>>(
  config: PolyRPCReactConfig = {}
) {
  const queryClient = config.queryClient || new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60, // 1 minute
        retry: 1,
      },
    },
  });

  const mergedConfig: Required<PolyRPCReactConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    headers: { ...DEFAULT_CONFIG.headers, ...config.headers },
    queryClient,
  };

  // Create the base client for direct calls
  const baseClient = createClient(mergedConfig);

  // Create the proxy with hooks
  const py = createReactProxy<TRoutes>([], mergedConfig, baseClient);

  // Provider component
  function PolyRPCProvider({ children }: { children: ReactNode }) {
    const value = useMemo(
      () => ({ config: mergedConfig, queryClient }),
      [mergedConfig, queryClient]
    );

    return (
      <QueryClientProvider client={queryClient}>
        <PolyRPCContext.Provider value={value}>
          {children}
        </PolyRPCContext.Provider>
      </QueryClientProvider>
    );
  }

  return {
    py,
    PolyRPCProvider,
    queryClient,
  };
}

/**
 * Create a recursive proxy with React Query hooks
 */
function createReactProxy<T>(
  path: string[],
  config: Required<PolyRPCReactConfig>,
  client: ReturnType<typeof createClient>
): T {
  const target: ProxyTarget = {
    __path: path,
    __config: config,
    __client: client,
  };

  return new Proxy(target, {
    get(target, prop: string) {
      // Handle hook methods
      if (prop === 'useQuery') {
        return createUseQueryHook(target.__path, target.__config, target.__client);
      }
      if (prop === 'useMutation') {
        return createUseMutationHook(target.__path, target.__config, target.__client);
      }
      if (prop === 'getQueryKey') {
        return (input?: unknown) => buildQueryKey(target.__path, input);
      }
      if (prop === 'prefetch') {
        return createPrefetchFn(target.__path, target.__config, target.__client);
      }
      if (prop === 'invalidate') {
        return createInvalidateFn(target.__path, target.__config);
      }

      // Handle direct client methods
      if (prop === 'query' || prop === 'mutate') {
        return getNestedValue(target.__client, [...target.__path, prop]);
      }

      // Handle internal properties
      if (prop === '__path' || prop === '__config' || prop === '__client') {
        return target[prop];
      }

      // Handle Symbol properties
      if (typeof prop === 'symbol') {
        return undefined;
      }

      // Recurse deeper
      return createReactProxy([...target.__path, prop], target.__config, target.__client);
    },
  }) as T;
}

/**
 * Create useQuery hook for a route
 */
function createUseQueryHook(
  path: string[],
  config: Required<PolyRPCReactConfig>,
  client: ReturnType<typeof createClient>
) {
  return function useRouteQuery<TInput, TOutput>(
    input?: TInput,
    options?: Omit<UseQueryOptions<TOutput, PolyRPCError>, 'queryKey' | 'queryFn'>
  ) {
    const queryKey = buildQueryKey(path, input);

    // Get the query function from the client
    const queryFn = getNestedValue(client, [...path, 'query']) as (
      input?: TInput
    ) => Promise<TOutput>;

    return useQuery<TOutput, PolyRPCError>({
      queryKey,
      queryFn: () => queryFn(input),
      ...options,
    });
  };
}

/**
 * Create useMutation hook for a route
 */
function createUseMutationHook(
  path: string[],
  config: Required<PolyRPCReactConfig>,
  client: ReturnType<typeof createClient>
) {
  return function useRouteMutation<TInput, TOutput>(
    options?: Omit<UseMutationOptions<TOutput, PolyRPCError, TInput>, 'mutationFn'>
  ) {
    // Get the mutate function from the client
    const mutateFn = getNestedValue(client, [...path, 'mutate']) as (
      input?: TInput
    ) => Promise<TOutput>;

    return useMutation<TOutput, PolyRPCError, TInput>({
      mutationFn: (input) => mutateFn(input),
      ...options,
    });
  };
}

/**
 * Create prefetch function
 */
function createPrefetchFn(
  path: string[],
  config: Required<PolyRPCReactConfig>,
  client: ReturnType<typeof createClient>
) {
  return async function prefetch<TInput>(input?: TInput) {
    const queryKey = buildQueryKey(path, input);
    const queryFn = getNestedValue(client, [...path, 'query']) as (
      input?: TInput
    ) => Promise<unknown>;

    await config.queryClient.prefetchQuery({
      queryKey,
      queryFn: () => queryFn(input),
    });
  };
}

/**
 * Create invalidate function
 */
function createInvalidateFn(path: string[], config: Required<PolyRPCReactConfig>) {
  return async function invalidate<TInput>(input?: TInput) {
    const queryKey = buildQueryKey(path, input);
    await config.queryClient.invalidateQueries({ queryKey });
  };
}

/**
 * Build a query key from path and input
 */
function buildQueryKey(path: string[], input?: unknown): QueryKey {
  const key: unknown[] = ['polyrpc', ...path];
  if (input !== undefined) {
    key.push(input);
  }
  return key as QueryKey;
}

/**
 * Get a nested value from an object using a path array
 */
function getNestedValue(obj: unknown, path: string[]): unknown {
  let current = obj;
  for (const key of path) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

// ============ Exports ============

export { PolyRPCError } from '@polyrpc/client';
export type { ClientConfig, QueryOptions, MutationOptions } from '@polyrpc/client';
