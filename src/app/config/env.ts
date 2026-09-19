import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url(),
  VITE_APP_NAME: z.string().min(1).default('Dashboard'),
});

export const env = envSchema.parse(import.meta.env);
