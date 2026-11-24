import { useState } from 'react';
import {
  validateAuth,
  type AuthErrors,
  type AuthMode,
  type AuthValues,
} from '@/lib/auth-validation';

type AuthField = keyof AuthValues;
type FormState = {
  values: AuthValues;
  errors: AuthErrors;
  touched: Partial<Record<AuthField, boolean>>;
};

const emptyValues: AuthValues = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function useAuthForm(mode: AuthMode) {
  const [form, setForm] = useState<FormState>({
    values: { ...emptyValues },
    errors: {},
    touched: {},
  });

  function setField(field: AuthField, value: string) {
    setForm((current) => {
      const values = { ...current.values, [field]: value };
      const nextErrors = validateAuth(mode, values);
      const errors = { ...current.errors };

      if (current.touched[field]) {
        errors[field] = nextErrors[field];
      }
      if (field === 'password' && current.touched.confirmPassword) {
        errors.confirmPassword = nextErrors.confirmPassword;
      }

      return { ...current, values, errors };
    });
  }

  function blurField(field: AuthField) {
    setForm((current) => ({
      ...current,
      touched: { ...current.touched, [field]: true },
      errors: { ...current.errors, [field]: validateAuth(mode, current.values)[field] },
    }));
  }

  function submit(): { valid: boolean; errors: AuthErrors } {
    const errors = validateAuth(mode, form.values);
    setForm((current) => ({
      ...current,
      errors,
      touched: { fullName: true, email: true, password: true, confirmPassword: true },
    }));
    return { valid: Object.keys(errors).length === 0, errors };
  }

  return { values: form.values, errors: form.errors, setField, blurField, submit };
}
