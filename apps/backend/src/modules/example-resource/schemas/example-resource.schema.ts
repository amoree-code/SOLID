import { z } from 'zod';

/** The resource as this API returns it. */
export const exampleResourceSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
});

export type ExampleResource = z.infer<typeof exampleResourceSchema>;
