import type { Permission } from '@/shared/permissions/permission.types';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: Permission[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string | null;
};
