import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/auth/AuthForm';

export default function WelcomeScreen() {
  return (
    <AuthLayout showIntro>
      <AuthForm mode="login" />
    </AuthLayout>
  );
}
