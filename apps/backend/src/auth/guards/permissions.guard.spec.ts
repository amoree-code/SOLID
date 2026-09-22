import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../types/auth-user.type.js';
import { PermissionsGuard } from './permissions.guard.js';

function buildContext(user: AuthUser | undefined): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => vi.fn(),
    getClass: () => vi.fn(),
  } as unknown as ExecutionContext;
}

function buildUser(permissions: string[]): AuthUser {
  return { id: '1', name: 'Test', email: 'test@example.com', roles: [], permissions };
}

describe('PermissionsGuard', () => {
  let reflector: Reflector;
  let guard: PermissionsGuard;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new PermissionsGuard(reflector);
  });

  it('allows the request when no permission is required', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    expect(guard.canActivate(buildContext(undefined))).toBe(true);
  });

  it('allows a user who has the required permission', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue('items.read');
    const context = buildContext(buildUser(['items.read']));
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a user without the required permission', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue('items.delete');
    const context = buildContext(buildUser(['items.read']));
    expect(() => guard.canActivate(context)).toThrow();
  });

  it('denies when there is no user on the request', () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue('items.read');
    expect(() => guard.canActivate(buildContext(undefined))).toThrow();
  });
});
