import { SetMetadata } from '@nestjs/common';

export const REQUIRED_PERMISSION_KEY = 'requiredPermission';

/**
 * `@RequirePermission('items.read')` — a permission is a plain string here,
 * on purpose, matching the dashboard template's `Permission = string`: this
 * backend defines what strings exist (whatever you name them), and neither
 * side hardcodes an assumption about the other's naming convention.
 */
export const RequirePermission = (permission: string) =>
  SetMetadata(REQUIRED_PERMISSION_KEY, permission);
