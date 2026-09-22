import { z } from 'zod';

export const verifyFormSchema = z.object({
  code: z.string().length(6),
});

export type VerifyFormValues = z.infer<typeof verifyFormSchema>;
