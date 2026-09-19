import { type QueryClient, queryOptions, useQuery } from '@tanstack/react-query';
import { httpClient } from '@/shared/services/http-client';
import type { AuthUser } from './auth.types';
import { sessionStorage } from './session-storage';

export const sessionKeys = {
  all: ['session'] as const,
  currentUser: () => [...sessionKeys.all, 'current-user'] as const,
};

async function getCurrentUser(): Promise<AuthUser | null> {
  if (!sessionStorage.getAccessToken()) {
    return null;
  }

  const response = await httpClient.get<AuthUser>('/auth/me');
  return response.data;
}

export function currentUserOptions() {
  return queryOptions({
    queryKey: sessionKeys.currentUser(),
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Reads the session synchronously from the query cache, for router `beforeLoad`
 * guards that run outside React and must not wait on a component render.
 */
export function getSessionUser(queryClient: QueryClient): AuthUser | null {
  return queryClient.getQueryData<AuthUser | null>(sessionKeys.currentUser()) ?? null;
}

export function useSession() {
  const query = useQuery(currentUserOptions());

  return {
    user: query.data ?? null,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(query.data),
  };
}
