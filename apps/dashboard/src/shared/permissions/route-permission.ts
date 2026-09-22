import type { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { getSessionUser } from '@/shared/auth/session';
import { can } from './can';
import type { Permission } from './permission.types';

export function requirePermission(queryClient: QueryClient, permission: Permission): void {
  const user = getSessionUser(queryClient);

  if (!user) {
    throw redirect({ to: '/login' });
  }

  if (!can(user, permission)) {
    throw redirect({ to: '/forbidden' });
  }
}
