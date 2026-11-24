export type AuthMode = 'login' | 'signup';

export type AuthValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type AuthErrors = Partial<Record<keyof AuthValues, string>>;

export function validateAuth(mode: AuthMode, values: AuthValues): AuthErrors {
  const errors: AuthErrors = {};

  if (mode === 'signup' && !values.fullName.trim()) {
    errors.fullName = 'Please enter your full name.';
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.password.trim()) {
    errors.password = 'Please enter your password.';
  } else if (mode === 'signup' && values.password.length < 8) {
    errors.password = 'Use at least 8 characters for your password.';
  }

  if (mode === 'signup') {
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Your passwords do not match.';
    }
  }

  return errors;
}
