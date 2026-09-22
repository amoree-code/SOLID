import { type AuthTokens, authTokensSchema } from '@/shared/auth/auth.schema';
import { httpClient } from '@/shared/services/http-client';
import type { VerifyFormValues } from '../schemas/verify-form.schema';

export async function verifyCode(input: VerifyFormValues): Promise<AuthTokens> {
  const response = await httpClient.post<unknown>('/auth/verify', input);
  return authTokensSchema.parse(response.data);
}
