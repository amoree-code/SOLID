import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().int().positive().default(3000),
  /** Comma-separated list of allowed browser origins. Empty = CORS disabled. */
  CORS_ORIGIN: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().url())),
  /** Rate limit: at most RATE_LIMIT_MAX requests per client per RATE_LIMIT_WINDOW_MS. */
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
});

export type Env = z.infer<typeof envSchema>;

/** Passed to `ConfigModule.forRoot({ validate })` — fails fast at boot, not on first request. */
export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
