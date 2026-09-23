import { fallback } from '@tanstack/zod-adapter';
import { z } from 'zod';

export const ITEM_PAGE_SIZES = [10, 25, 50, 100] as const;

export const defaultItemSearch = {
  page: 1,
  pageSize: 25,
  search: '',
  status: 'all',
  sort: 'createdAt',
  order: 'desc',
} as const;

/**
 * The page's URL state: `?page=2&pageSize=25&status=active&search=amer&sort=createdAt&order=desc`.
 * Every key is optional in links (`.default`) and a malformed value falls back
 * to its default instead of erroring (`fallback`), so a hand-edited or stale
 * bookmarked URL always renders.
 */
export const itemSearchSchema = z.object({
  page: fallback(z.coerce.number().int().positive(), defaultItemSearch.page).default(
    defaultItemSearch.page,
  ),
  pageSize: fallback(
    z.coerce
      .number()
      .int()
      .refine((value) => (ITEM_PAGE_SIZES as readonly number[]).includes(value)),
    defaultItemSearch.pageSize,
  ).default(defaultItemSearch.pageSize),
  search: fallback(z.string().trim().max(100), defaultItemSearch.search).default(
    defaultItemSearch.search,
  ),
  status: fallback(z.enum(['all', 'active', 'inactive']), defaultItemSearch.status).default(
    defaultItemSearch.status,
  ),
  sort: fallback(z.enum(['name', 'createdAt']), defaultItemSearch.sort).default(
    defaultItemSearch.sort,
  ),
  order: fallback(z.enum(['asc', 'desc']), defaultItemSearch.order).default(
    defaultItemSearch.order,
  ),
});

export type ItemSearch = z.infer<typeof itemSearchSchema>;
