/**
 * Local, convenience constants — NOT the source of truth for what
 * permissions exist. `Permission` (see permission.types.ts) is a plain
 * `string`; the real values always come from `user.permissions` on
 * `GET /auth/me`, in whatever naming convention your backend actually uses.
 *
 * These exist so a page can write `permissions.items.read` instead of a
 * bare `'items.read'` literal (autocomplete, one place to rename from), but
 * nothing enforces that a permission string must appear here. Replace these
 * examples with your backend's real identifiers before treating this as
 * anything but a placeholder.
 */
export const permissions = {
  items: {
    read: 'items.read',
    create: 'items.create',
    update: 'items.update',
    delete: 'items.delete',
  },
  users: {
    read: 'users.read',
    create: 'users.create',
    update: 'users.update',
    delete: 'users.delete',
  },
  settings: {
    read: 'settings.read',
    update: 'settings.update',
  },
} as const;
