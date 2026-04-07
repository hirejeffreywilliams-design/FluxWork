// © 2024-2026 Jeffrey W Williams LLC. All Rights Reserved. Proprietary.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../lib/queryClient.js';
import type { User } from '../../../shared/types.js';

interface AuthResponse {
  success: boolean;
  data?: User;
  error?: string;
}

export function useAuth() {
  const qc = useQueryClient();

  const { data: authData, isLoading } = useQuery<AuthResponse>({
    queryKey: ['auth', 'me'],
    queryFn: () => apiFetch<AuthResponse>('/api/auth/me'),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (creds: { username: string; password: string }) =>
      apiFetch<AuthResponse>('/api/auth/login', { method: 'POST', body: creds }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });

  const registerMutation = useMutation({
    mutationFn: (data: { username: string; email: string; password: string; displayName?: string }) =>
      apiFetch<AuthResponse>('/api/auth/register', { method: 'POST', body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiFetch('/api/auth/logout', { method: 'POST' }),
    onSuccess: () => {
      qc.clear();
      window.location.href = '/login';
    },
  });

  const user = authData?.success ? authData.data : null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutate,
    loginError: loginMutation.error?.message,
    registerError: registerMutation.error?.message,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
