import { createFileRoute } from '@tanstack/react-router';
import { SignupForm } from './components/signup-form';

export const Route = createFileRoute('/_auth/signup/')({
  component: SignupForm,
});
