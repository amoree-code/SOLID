import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { sessionKeys } from '@/shared/auth/session';
import { sessionStorage } from '@/shared/auth/session-storage';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field';
import { Input } from '@/shared/components/ui/input';
import { useTranslation } from '@/shared/i18n/use-translation';
import { getErrorMessage } from '@/shared/services/error-normalizer';
import { type SignupFormValues, signupFormSchema } from '../schemas/signup-form.schema';
import { signup } from '../services/signup.service';

export function SignupForm() {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupFormSchema) });

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: async (tokens) => {
      sessionStorage.setAccessToken(tokens.accessToken);
      await queryClient.invalidateQueries({ queryKey: sessionKeys.currentUser() });
      await navigate({ to: '/' });
    },
  });

  async function onSubmit(values: SignupFormValues) {
    await signupMutation.mutateAsync(values);
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t('signup.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">{t('signup.name')}</FieldLabel>
              <Input id="name" type="text" autoComplete="name" {...register('name')} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="email">{t('signup.email')}</FieldLabel>
              <Input id="email" type="email" autoComplete="email" {...register('email')} />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">{t('signup.password')}</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
              />
              <FieldError errors={[errors.password]} />
            </Field>
            {signupMutation.isError ? (
              <FieldError>{getErrorMessage(signupMutation.error)}</FieldError>
            ) : null}
            <Field>
              <Button type="submit" disabled={signupMutation.isPending}>
                {t('signup.submit')}
              </Button>
              <FieldDescription className="text-center">
                {t('signup.haveAccount')} <Link to="/login">{t('signup.signIn')}</Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
