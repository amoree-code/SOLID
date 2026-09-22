import { z } from 'zod';

/** Matches the dashboard template's `item-search.schema.ts` — same fields,
 * same defaults, same fallback ("catch") behavior — so the query string it
 * sends decodes into exactly what this endpoint expects. */
export const itemSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().min(10).max(100).catch(25),
  search: z.string().trim().catch(''),
  status: z.enum(['all', 'active', 'inactive']).catch('all'),
  sort: z.enum(['name', 'createdAt']).catch('createdAt'),
  order: z.enum(['asc', 'desc']).catch('desc'),
});

export type ItemSearch = z.infer<typeof itemSearchSchema>;
