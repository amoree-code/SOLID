import { z } from 'zod';

export const createExampleResourceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  status: z.enum(['active', 'inactive']),
});

export type CreateExampleResourceInput = z.infer<typeof createExampleResourceSchema>;

/** PATCH semantics: any subset of the create fields, but at least one. */
export const updateExampleResourceSchema = createExampleResourceSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, { message: 'Provide at least one field.' });

export type UpdateExampleResourceInput = z.infer<typeof updateExampleResourceSchema>;
