import { z } from 'zod';

/** An absolute URL, or a same-origin path such as `/api` behind a reverse proxy. */
const apiBaseUrl = z.string().refine((value) => value.startsWith('/') || URL.canParse(value), {
  message: 'must be an absolute URL (https://api.example.com) or a path (/api)',
});

// Optional: the empty base calls no API. Set it once a page needs one — the
// HTTP client refuses to send a request without it (see http-client.ts).
const envSchema = z.object({
  VITE_API_BASE_URL: z.preprocess(
    (value) => (value === '' ? undefined : value),
    apiBaseUrl.optional(),
  ),
  VITE_APP_NAME: z.string().min(1).default('Dashboard'),
});

export const env = envSchema.parse(import.meta.env);
