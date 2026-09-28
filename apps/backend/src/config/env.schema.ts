import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) => value.startsWith('postgresql://') || value.startsWith('postgres://'),
      'DATABASE_URL must use the postgresql:// or postgres:// protocol',
    ),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
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
  /** Set to false in production unless the docs endpoint is intentionally public. */
  SWAGGER_ENABLED: z.preprocess(
    (value) => (typeof value === 'string' ? value.toLowerCase() === 'true' : value),
    z.boolean().default(true),
  ),
  /** Number of trusted proxy hops. Keep 0 when the API is directly exposed. */
  TRUST_PROXY: z.coerce.number().int().nonnegative().default(0),
});

export type Env = z.infer<typeof envSchema>;

/** Passed to `ConfigModule.forRoot({ validate })` — fails fast at boot, not on first request. */
export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
