import { z } from 'zod';

export const itemSearchSchema = z.object({
  page: z.coerce.number().int().positive().catch(1),
  pageSize: z.coerce.number().int().min(10).max(100).catch(25),
  search: z.string().trim().catch(''),
  status: z.enum(['all', 'active', 'inactive']).catch('all'),
  sort: z.enum(['name', 'createdAt']).catch('createdAt'),
  order: z.enum(['asc', 'desc']).catch('desc'),
});

export type ItemSearch = z.infer<typeof itemSearchSchema>;
