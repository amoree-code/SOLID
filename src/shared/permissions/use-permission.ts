import { useSession } from '@/shared/auth/session';
import { can } from './can';
import type { Permission } from './permission.types';

export function usePermission(permission: Permission): boolean {
  const { user } = useSession();
  return can(user, permission);
}
