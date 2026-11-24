import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

export default function SignUpScreen() {
  return (
    <AuthLayout>
      <AuthForm mode="signup" />
    </AuthLayout>
  );
}
