import { z } from 'zod';

export const itemFormSchema = z.object({
  name: z.string().trim().min(2).max(80),
  status: z.enum(['active', 'inactive']),
});

export type ItemFormValues = z.infer<typeof itemFormSchema>;
