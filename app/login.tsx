import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

export default function LoginScreen() {
  return (
    <AuthLayout>
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
