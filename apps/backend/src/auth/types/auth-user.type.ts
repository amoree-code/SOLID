/**
 * Deliberately identical, field-for-field, to the dashboard template's
 * `AuthUser` (apps/dashboard/src/shared/auth/auth.schema.ts) — the whole
 * point of building both in one repo is that neither needs a mapping layer.
 */
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string | null;
};
