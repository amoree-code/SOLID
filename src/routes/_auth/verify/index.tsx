import { createFileRoute } from '@tanstack/react-router';
import { VerifyForm } from './components/verify-form';

export const Route = createFileRoute('/_auth/verify/')({
  component: VerifyForm,
});
