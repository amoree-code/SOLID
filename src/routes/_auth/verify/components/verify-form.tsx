import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { sessionKeys } from '@/shared/auth/session';
import { sessionStorage } from '@/shared/auth/session-storage';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { getErrorMessage } from '@/shared/services/error-normalizer';
import { type VerifyFormValues, verifyFormSchema } from '../schemas/verify-form.schema';
import { verifyCode } from '../services/verify.service';

export function VerifyForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>({ resolver: zodResolver(verifyFormSchema) });

  const verifyMutation = useMutation({
    mutationFn: verifyCode,
    onSuccess: async (tokens) => {
      sessionStorage.setAccessToken(tokens.accessToken);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.currentUser() });
      await navigate({ to: '/' });
    },
  });

  async function onSubmit(values: VerifyFormValues) {
    await verifyMutation.mutateAsync(values);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Verify your account</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Verification code</Label>
            <Input id="code" inputMode="numeric" maxLength={6} {...register('code')} />
            {errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}
          </div>
          {verifyMutation.isError ? (
            <p className="text-xs text-destructive">{getErrorMessage(verifyMutation.error)}</p>
          ) : null}
          <Button type="submit" disabled={verifyMutation.isPending}>
            Verify
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
