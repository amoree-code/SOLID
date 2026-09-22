import type { AuthUser } from '@/shared/auth/auth.schema';
import type { Permission } from './permission.types';

export function can(user: AuthUser | null, permission: Permission): boolean {
  return user?.permissions.includes(permission) ?? false;
}

export function canAny(user: AuthUser | null, permissionList: Permission[]): boolean {
  return permissionList.some((permission) => can(user, permission));
}

export function canAll(user: AuthUser | null, permissionList: Permission[]): boolean {
  return permissionList.every((permission) => can(user, permission));
}
