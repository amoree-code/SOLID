import { z } from 'zod';

/**
 * Validates `/auth/me` the same way item.schema.ts validates an item — a
 * renamed or missing field (e.g. backend calls it `perms` instead of
 * `permissions`) fails loudly here instead of silently making every
 * permission check return false.
 */
export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const authTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().nullable(),
});

export type AuthTokens = z.infer<typeof authTokensSchema>;
