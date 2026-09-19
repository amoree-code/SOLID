import type { ReactNode } from 'react';
import type { Permission } from './permission.types';
import { usePermission } from './use-permission';

type PermissionGuardProps = {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
};

export function PermissionGuard({ permission, children, fallback = null }: PermissionGuardProps) {
  const allowed = usePermission(permission);
  return allowed ? children : fallback;
}
