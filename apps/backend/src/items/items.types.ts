import type { Item } from './schemas/item.schema.js';

/** Matches the dashboard template's `shared/query/query.types.ts` shape. */
export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ItemListResponse = PaginatedResponse<Item>;
