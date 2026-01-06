/**
 * PolyRPC Client
 *
 * A type-safe client for calling Python APIs from TypeScript.
 * Uses Proxy magic to provide a tRPC-like developer experience.
 *
 * @example
 * ```typescript
 * import { createClient } from '@polyrpc/client';
 *
 * const py = createClient({ baseUrl: '/api' });
 *
 * // Fully typed - autocomplete works!
 * const user = await py.users.get.query({ id: 1 });
 * ```
 */

// ============ Types ============

export interface ClientConfig {
  /** Base URL for API calls (default: '/api') */
  baseUrl?: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Default headers to include in all requests */
  headers?: Record<string, string>;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Transform request before sending */
  onRequest?: (request: RequestInit) => RequestInit | Promise<RequestInit>;
  /** Transform response after receiving */
  onResponse?: <T>(response: Response, data: T) => T | Promise<T>;
  /** Handle errors */
  onError?: (error: PolyRPCError) => void;
}

export interface QueryOptions {
  /** Override headers for this request */
  headers?: Record<string, string>;
  /** Abort signal for cancellation */
  signal?: AbortSignal;
}

export interface MutationOptions extends QueryOptions {
  /** HTTP method override (default: POST) */
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

export class PolyRPCError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PolyRPCError';
  }
}

// ============ Internal Types ============

interface RouteHandler {
  query: <TInput, TOutput>(input?: TInput, options?: QueryOptions) => Promise<TOutput>;
  mutate: <TInput, TOutput>(input?: TInput, options?: MutationOptions) => Promise<TOutput>;
}

type ProxyTarget = {
  __path: string[];
  __config: Required<ClientConfig>;
};

// ============ Implementation ============

const DEFAULT_CONFIG: Required<ClientConfig> = {
  baseUrl: '/api',
  fetch: globalThis.fetch,
  headers: {},
  timeout: 30000,
  onRequest: (req) => req,
  onResponse: (_, data) => data,
  onError: () => {},
};

/**
 * Create a type-safe PolyRPC client
 */
export function createClient<TRoutes = Record<string, unknown>>(
  config: ClientConfig = {}
): TRoutes {
  const mergedConfig: Required<ClientConfig> = {
    ...DEFAULT_CONFIG,
    ...config,
    headers: { ...DEFAULT_CONFIG.headers, ...config.headers },
  };

  return createProxy<TRoutes>([], mergedConfig);
}

/**
 * Create a recursive proxy that builds up the path
 */
function createProxy<T>(path: string[], config: Required<ClientConfig>): T {
  const target: ProxyTarget = {
    __path: path,
    __config: config,
  };

  return new Proxy(target, {
    get(target, prop: string) {
      // Handle special methods
      if (prop === 'query') {
        return createQueryHandler(target.__path, target.__config);
      }
      if (prop === 'mutate') {
        return createMutateHandler(target.__path, target.__config);
      }

      // Handle internal properties
      if (prop === '__path' || prop === '__config') {
        return target[prop];
      }

      // Handle Symbol properties (for debugging)
      if (typeof prop === 'symbol') {
        return undefined;
      }

      // Recurse deeper into the path
      return createProxy([...target.__path, prop], target.__config);
    },
  }) as T;
}

/**
 * Create a query handler (GET request)
 */
function createQueryHandler(path: string[], config: Required<ClientConfig>) {
  return async <TInput extends Record<string, unknown> | undefined, TOutput>(
    input?: TInput,
    options: QueryOptions = {}
  ): Promise<TOutput> => {
    const url = buildUrl(config.baseUrl, path, input as Record<string, unknown> | undefined);

    const requestInit: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...options.headers,
      },
      signal: options.signal,
    };

    return executeRequest<TOutput>(url, requestInit, config);
  };
}

/**
 * Create a mutation handler (POST/PUT/PATCH/DELETE request)
 */
function createMutateHandler(path: string[], config: Required<ClientConfig>) {
  return async <TInput, TOutput>(
    input?: TInput,
    options: MutationOptions = {}
  ): Promise<TOutput> => {
    const url = buildUrl(config.baseUrl, path);
    const method = options.method || 'POST';

    const requestInit: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
        ...options.headers,
      },
      body: input ? JSON.stringify(input) : undefined,
      signal: options.signal,
    };

    return executeRequest<TOutput>(url, requestInit, config);
  };
}

/**
 * Build URL from base, path segments, and optional query params
 */
function buildUrl(
  baseUrl: string,
  path: string[],
  queryParams?: Record<string, unknown>
): string {
  // Join path segments
  const pathStr = path.join('/');
  let url = `${baseUrl.replace(/\/$/, '')}/${pathStr}`;

  // Add query parameters for GET requests
  if (queryParams && typeof queryParams === 'object') {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return url;
}

/**
 * Execute the HTTP request with error handling
 */
async function executeRequest<T>(
  url: string,
  init: RequestInit,
  config: Required<ClientConfig>
): Promise<T> {
  // Apply request transform
  const transformedInit = await config.onRequest(init);

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  // Merge abort signals
  if (transformedInit.signal) {
    transformedInit.signal.addEventListener('abort', () => controller.abort());
  }
  transformedInit.signal = controller.signal;

  try {
    const response = await config.fetch(url, transformedInit);

    clearTimeout(timeoutId);

    // Handle non-OK responses
    if (!response.ok) {
      let errorData: unknown;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }

      const error = new PolyRPCError(
        `Request failed with status ${response.status}`,
        response.status,
        (errorData as { code?: string })?.code,
        errorData
      );

      config.onError(error);
      throw error;
    }

    // Parse response
    const data = await response.json();

    // Apply response transform
    return config.onResponse(response, data) as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof PolyRPCError) {
      throw error;
    }

    // Handle abort/timeout
    if (error instanceof DOMException && error.name === 'AbortError') {
      const timeoutError = new PolyRPCError('Request timeout', 408, 'TIMEOUT');
      config.onError(timeoutError);
      throw timeoutError;
    }

    // Handle network errors
    const networkError = new PolyRPCError(
      error instanceof Error ? error.message : 'Network error',
      0,
      'NETWORK_ERROR'
    );
    config.onError(networkError);
    throw networkError;
  }
}

// ============ Utility Exports ============

/**
 * Type helper for inferring route types from generated definitions
 */
export type InferInput<T> = T extends { input: infer I } ? I : never;
export type InferOutput<T> = T extends { output: infer O } ? O : never;

/**
 * Re-export error class for type checking
 */
export { PolyRPCError as Error };
