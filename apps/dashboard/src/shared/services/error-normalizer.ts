import { isAxiosError } from 'axios';
import { z } from 'zod';

export type NormalizedError = {
  message: string;
  status: number | null;
  code: string | null;
  fieldErrors: Record<string, string[]> | null;
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_MESSAGE = 'Could not reach the server. Check your connection and try again.';

/**
 * The common error-body conventions, all optional: `{ message, code, errors }`,
 * Nest's default `{ message: string[] }`, and `fieldErrors` as an alias. Not
 * tied to any particular backend — anything else falls back to a generic message.
 */
const errorBodySchema = z.object({
  message: z.union([z.string(), z.array(z.string())]).optional(),
  code: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
  fieldErrors: z.record(z.array(z.string())).optional(),
});

export function normalizeError(error: unknown): NormalizedError {
  if (!isAxiosError(error)) {
    return { message: FALLBACK_MESSAGE, status: null, code: null, fieldErrors: null };
  }

  if (!error.response) {
    return { message: NETWORK_MESSAGE, status: null, code: error.code ?? null, fieldErrors: null };
  }

  const parsed = errorBodySchema.safeParse(error.response.data);
  const body = parsed.success ? parsed.data : {};
  const message = Array.isArray(body.message) ? body.message.join(', ') : body.message;

  return {
    message: message || FALLBACK_MESSAGE,
    status: error.response.status,
    code: body.code ?? error.code ?? null,
    fieldErrors: body.errors ?? body.fieldErrors ?? null,
  };
}

export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message;
}
