import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { sessionKeys } from '@/shared/auth/session';
import { sessionStorage } from '@/shared/auth/session-storage';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useTranslation } from '@/shared/i18n/use-translation';
import { getErrorMessage } from '@/shared/services/error-normalizer';
import { type LoginFormValues, loginFormSchema } from '../schemas/login-form.schema';
import { login } from '../services/login.service';

export function LoginForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (tokens) => {
      sessionStorage.setAccessToken(tokens.accessToken);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.currentUser() });
      await navigate({ to: '/' });
    },
  });

  async function onSubmit(values: LoginFormValues) {
    await loginMutation.mutateAsync(values);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{t('login.title')}</CardTitle>
        <CardDescription>{t('login.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">{t('login.email')}</Label>
            <Input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">{t('login.password')}</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            ) : null}
          </div>
          {loginMutation.isError ? (
            <p className="text-xs text-destructive">{getErrorMessage(loginMutation.error)}</p>
          ) : null}
        </form>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="login-form"
          disabled={loginMutation.isPending}
          className="w-full"
        >
          {t('login.submit')}
        </Button>
      </CardFooter>
    </Card>
  );
}
