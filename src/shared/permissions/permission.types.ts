import type { permissions } from './permission-map';

type PermissionGroup = typeof permissions;

export type Permission = {
  [Group in keyof PermissionGroup]: PermissionGroup[Group][keyof PermissionGroup[Group]];
}[keyof PermissionGroup];
