import { z } from 'zod';

// `pnpm dev` works straight after cloning: in development the API defaults to
// the backend template's local address. Production builds must set it — the
// build itself refuses to run without it (see vite.config.ts).
const DEV_API_BASE_URL = 'http://localhost:3000';

/** An absolute URL, or a same-origin path such as `/api` behind a reverse proxy. */
const apiBaseUrl = z.string().refine((value) => value.startsWith('/') || URL.canParse(value), {
  message: 'must be an absolute URL (https://api.example.com) or a path (/api)',
});

const envSchema = z.object({
  VITE_API_BASE_URL: import.meta.env.DEV ? apiBaseUrl.default(DEV_API_BASE_URL) : apiBaseUrl,
  VITE_APP_NAME: z.string().min(1).default('Dashboard'),
});

export const env = envSchema.parse(import.meta.env);
