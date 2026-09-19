import { AxiosError } from 'axios';

export type NormalizedError = {
  message: string;
  status: number | null;
  code: string | null;
  fieldErrors: Record<string, string[]> | null;
};

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; code?: string; errors?: Record<string, string[]> }
      | undefined;

    return {
      message: data?.message ?? FALLBACK_MESSAGE,
      status: error.response?.status ?? null,
      code: data?.code ?? error.code ?? null,
      fieldErrors: data?.errors ?? null,
    };
  }

  if (error instanceof Error) {
    return { message: FALLBACK_MESSAGE, status: null, code: null, fieldErrors: null };
  }

  return { message: FALLBACK_MESSAGE, status: null, code: null, fieldErrors: null };
}

export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message;
}
