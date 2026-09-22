import { z } from 'zod';

/** Matches the dashboard template's `item-form.schema.ts`. */
export const createItemSchema = z.object({
  name: z.string().trim().min(2).max(80),
  status: z.enum(['active', 'inactive']),
});

export type CreateItemInput = z.infer<typeof createItemSchema>;

export const updateItemSchema = createItemSchema;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
