/**
 * PolyRPC Client Setup (Standalone version for example)
 * 
 * In production, you'd use @polyrpc/client and @polyrpc/react packages.
 * This is a simplified inline version for the demo.
 */

import { QueryClient, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types from generated polyrpc.d.ts
export type { User, Post, CreateUserRequest, UpdateUserRequest, CreatePostRequest, PaginatedResponse } from './polyrpc.d';

const BASE_URL = 'http://localhost:8000';

// Simple fetch wrapper
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

// Query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

// API hooks - these match the generated types
export const py = {
  users: {
    list_users: {
      useQuery: (input?: { page?: number; per_page?: number; role?: string }) => {
        const params = new URLSearchParams();
        if (input?.page) params.set('page', String(input.page));
        if (input?.per_page) params.set('per_page', String(input.per_page));
        if (input?.role) params.set('role', input.role);
        const query = params.toString();
        
        return useQuery({
          queryKey: ['users', 'list', input],
          queryFn: () => fetchApi<import('./polyrpc.d').PaginatedResponse>(`/users${query ? `?${query}` : ''}`),
        });
      },
      invalidate: () => queryClient.invalidateQueries({ queryKey: ['users', 'list'] }),
    },
    get_user: {
      useQuery: (input: { user_id: number }) => {
        return useQuery({
          queryKey: ['users', 'get', input.user_id],
          queryFn: () => fetchApi<import('./polyrpc.d').User>(`/users/${input.user_id}`),
        });
      },
    },
    create_user: {
      useMutation: (options?: { onSuccess?: (data: import('./polyrpc.d').User) => void }) => {
        return useMutation({
          mutationFn: (input: import('./polyrpc.d').CreateUserRequest) =>
            fetchApi<import('./polyrpc.d').User>('/users', {
              method: 'POST',
              body: JSON.stringify(input),
            }),
          onSuccess: options?.onSuccess,
        });
      },
    },
    update_user: {
      useMutation: (options?: { onSuccess?: () => void }) => {
        return useMutation({
          mutationFn: (input: { user_id: number } & import('./polyrpc.d').UpdateUserRequest) =>
            fetchApi<import('./polyrpc.d').User>(`/users/${input.user_id}`, {
              method: 'PUT',
              body: JSON.stringify(input),
            }),
          onSuccess: options?.onSuccess,
        });
      },
    },
    delete_user: {
      useMutation: (options?: { onSuccess?: () => void }) => {
        return useMutation({
          mutationFn: (input: { user_id: number }) =>
            fetchApi<{ success: boolean; deleted_id: number }>(`/users/${input.user_id}`, {
              method: 'DELETE',
            }),
          onSuccess: options?.onSuccess,
        });
      },
    },
  },
  posts: {
    list_posts: {
      useQuery: (input?: { author_id?: number }) => {
        const params = input?.author_id ? `?author_id=${input.author_id}` : '';
        return useQuery({
          queryKey: ['posts', 'list', input],
          queryFn: () => fetchApi<import('./polyrpc.d').Post[]>(`/posts${params}`),
        });
      },
    },
  },
  health: {
    health_check: {
      useQuery: () => {
        return useQuery({
          queryKey: ['health'],
          queryFn: () => fetchApi<{ status: string; timestamp: string }>('/health'),
        });
      },
    },
  },
};
