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
