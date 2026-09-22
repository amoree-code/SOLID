import { z } from 'zod';

/** Matches the dashboard template's `item.schema.ts` field-for-field. */
export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
});

export type Item = z.infer<typeof itemSchema>;
