import { describe, expect, it } from 'vitest';
import type { AuthUser } from '@/shared/auth/auth.types';
import { can, canAll, canAny } from './can';
import { permissions } from './permission-map';

function buildUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    roles: [],
    permissions: [],
    ...overrides,
  };
}

describe('can', () => {
  it('allows a user with the required permission', () => {
    const user = buildUser({ permissions: [permissions.items.read] });
    expect(can(user, permissions.items.read)).toBe(true);
  });

  it('denies a user without the required permission', () => {
    const user = buildUser({ permissions: [] });
    expect(can(user, permissions.items.read)).toBe(false);
  });

  it('denies when there is no user', () => {
    expect(can(null, permissions.items.read)).toBe(false);
  });
});

describe('canAny / canAll', () => {
  const user = buildUser({ permissions: [permissions.items.read] });

  it('canAny returns true if at least one permission matches', () => {
    expect(canAny(user, [permissions.items.create, permissions.items.read])).toBe(true);
  });

  it('canAll returns false unless every permission matches', () => {
    expect(canAll(user, [permissions.items.create, permissions.items.read])).toBe(false);
  });
});
