import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSION_KEY } from '../decorators/require-permission.decorator.js';
import type { AuthUser } from '../types/auth-user.type.js';

/**
 * Mirrors the dashboard's `can()` exactly: `user.permissions.includes(permission)`.
 * Runs after JwtAuthGuard, so `request.user` is always populated here.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermission = this.reflector.getAllAndOverride<string | undefined>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthUser | undefined;

    if (!user?.permissions.includes(requiredPermission)) {
      throw new ForbiddenException({
        message: 'You do not have permission to perform this action.',
        code: 'FORBIDDEN',
        errors: null,
      });
    }

    return true;
  }
}
