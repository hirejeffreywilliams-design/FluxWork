// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function apiFetch<T = unknown>(
  path: string,
  options?: { method?: HttpMethod; body?: unknown }
): Promise<T> {
  const res = await fetch(path, {
    method: options?.method || 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}
