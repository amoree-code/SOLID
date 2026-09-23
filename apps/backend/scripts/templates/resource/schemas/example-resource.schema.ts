import { z } from 'zod';

/** The resource as this API returns it. */
export const exampleResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
});

export type ExampleResource = z.infer<typeof exampleResourceSchema>;

/** The list envelope, as a schema so the API docs can describe it. */
export const exampleResourceListSchema = z.object({
  items: z.array(exampleResourceSchema),
  total: z.number().int(),
  page: z.number().int(),
  pageSize: z.number().int(),
});
