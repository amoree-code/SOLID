import { z } from 'zod';

/**
 * List query string: `?page=2&pageSize=25&status=active&search=abc&sort=createdAt&order=desc`.
 * Every key is optional; a malformed value falls back to its default (`catch`)
 * instead of failing the request, so a stale or hand-edited URL still works.
 */
export const exampleResourceSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().min(1).max(100).catch(25),
  search: z.string().trim().max(100).catch(''),
  status: z.enum(['all', 'active', 'inactive']).catch('all'),
  sort: z.enum(['name', 'createdAt']).catch('createdAt'),
  order: z.enum(['asc', 'desc']).catch('desc'),
});

export type ExampleResourceSearch = z.infer<typeof exampleResourceSearchSchema>;
