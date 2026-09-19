import type { AuthTokens } from '@/shared/auth/auth.types';
import { httpClient } from '@/shared/services/http-client';
import type { VerifyFormValues } from '../schemas/verify-form.schema';

export async function verifyCode(input: VerifyFormValues): Promise<AuthTokens> {
  const response = await httpClient.post<AuthTokens>('/auth/verify', input);
  return response.data;
}
