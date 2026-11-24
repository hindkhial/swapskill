import { useId, useRef, useState, type ComponentRef } from 'react';
import { Keyboard, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useDemoAuth } from '@/context/DemoAuthContext';
import { useAuthForm } from '@/hooks/useAuthForm';
import { type AuthMode, type AuthValues } from '@/lib/auth-validation';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

type AuthField = keyof AuthValues;

const FIELD_DETAILS = {
  fullName: { label: 'Full name', placeholder: 'Your full name' },
  email: { label: 'Email', placeholder: 'you@example.com' },
  password: { label: 'Password', placeholder: 'Enter your password' },
  confirmPassword: { label: 'Confirm password', placeholder: 'Re-enter your password' },
};

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const formId = useId();
  const { startDemo } = useDemoAuth();
  const { values, errors, setField, blurField, submit } = useAuthForm(mode);
  const [showResetHelp, setShowResetHelp] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Partial<Record<AuthField, boolean>>>({});
  const fullNameRef = useRef<ComponentRef<typeof TextInput>>(null);
  const emailRef = useRef<ComponentRef<typeof TextInput>>(null);
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const confirmPasswordRef = useRef<ComponentRef<typeof TextInput>>(null);
  const fieldRefs = {
    fullName: fullNameRef,
    email: emailRef,
    password: passwordRef,
    confirmPassword: confirmPasswordRef,
  };
  const isSignUp = mode === 'signup';
  const fields: AuthField[] = isSignUp
    ? ['fullName', 'email', 'password', 'confirmPassword']
    : ['email', 'password'];

  function handleSubmit() {
    const result = submit();
    if (!result.valid) {
      const firstInvalidField = fields.find((field) => result.errors[field]);
      if (firstInvalidField) {
        requestAnimationFrame(() => fieldRefs[firstInvalidField].current?.focus());
      }
      return;
    }

    Keyboard.dismiss();
    startDemo(
      { name: isSignUp ? values.fullName.trim() : 'friend', email: values.email.trim() },
      { needsSkills: isSignUp }
    );
  }

  // Card, Button, Input, Label, and Text are React Native Reusables primitives.
  return (
    <View className="w-full gap-3">
      <Card className="border-border bg-card gap-6 rounded-3xl p-6 shadow-none">
        <CardHeader className="gap-2 p-0">
          <CardTitle className="text-2xl leading-8">
            {isSignUp ? 'Create your account' : 'Log In'}
          </CardTitle>
          <CardDescription>
            {isSignUp ? 'Step 1 of 2 · Your details' : 'Welcome back to SwapSkill.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="gap-4 p-0">
          {fields.map((field, index) => {
            const { label, placeholder } = FIELD_DETAILS[field];
            const inputId = `${mode}-${formId}-${field}`;
            const messageId = `${inputId}-message`;
            const error = errors[field];
            const hint =
              field === 'password' && isSignUp ? 'Use at least 8 characters.' : undefined;
            const isPassword = field === 'password' || field === 'confirmPassword';
            const visible = !!visiblePasswords[field];
            const VisibilityIcon = visible ? EyeOff : Eye;
            const nextField = fields[index + 1];

            return (
              <View key={field} className="gap-2">
                <Label
                  htmlFor={inputId}
                  nativeID={`${inputId}-label`}
                  onPress={() => fieldRefs[field].current?.focus()}>
                  {label}
                </Label>
                <View className="relative">
                  <Input
                    ref={fieldRefs[field]}
                    nativeID={inputId}
                    accessibilityLabel={label}
                    accessibilityHint={error || hint}
                    aria-labelledby={`${inputId}-label`}
                    aria-describedby={error || hint ? messageId : undefined}
                    aria-invalid={!!error}
                    className={cn(
                      'bg-background h-12 rounded-xl px-3 text-base sm:h-12 md:text-base',
                      isPassword && 'pr-14',
                      error && 'border-destructive'
                    )}
                    placeholder={
                      isSignUp && field === 'password' ? 'Create a password' : placeholder
                    }
                    value={values[field]}
                    onChangeText={(value) => setField(field, value)}
                    onBlur={() => blurField(field)}
                    autoCapitalize={field === 'fullName' ? 'words' : 'none'}
                    autoCorrect={false}
                    autoComplete={isPassword ? 'off' : field === 'email' ? 'email' : 'name'}
                    textContentType={
                      isPassword ? 'none' : field === 'email' ? 'emailAddress' : 'name'
                    }
                    keyboardType={field === 'email' ? 'email-address' : 'default'}
                    secureTextEntry={isPassword && !visible}
                    returnKeyType={nextField ? 'next' : 'go'}
                    submitBehavior={nextField ? 'submit' : 'blurAndSubmit'}
                    onSubmitEditing={() => {
                      if (nextField) fieldRefs[nextField].current?.focus();
                      else handleSubmit();
                    }}
                  />
                  {isPassword ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-0 right-0 h-12 w-12 rounded-xl sm:h-12 sm:w-12"
                      accessibilityLabel={`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
                      accessibilityState={{ selected: visible }}
                      onPress={() =>
                        setVisiblePasswords((current) => ({ ...current, [field]: !current[field] }))
                      }>
                      <VisibilityIcon size={20} color={theme.colors.navy} strokeWidth={1.8} />
                    </Button>
                  ) : null}
                </View>
                {error || hint ? (
                  <Text
                    nativeID={messageId}
                    className={cn(
                      'text-xs leading-5',
                      error ? 'text-destructive' : 'text-muted-foreground'
                    )}
                    accessibilityLiveRegion={error ? 'polite' : 'none'}>
                    {error || hint}
                  </Text>
                ) : null}
              </View>
            );
          })}

          {!isSignUp ? (
            <View className="-mt-2 gap-2">
              <Button
                variant="ghost"
                className="h-12 self-end px-0 sm:h-12"
                accessibilityState={{ expanded: showResetHelp }}
                onPress={() => setShowResetHelp((visible) => !visible)}>
                <Text className="text-foreground text-sm">Forgot password?</Text>
              </Button>
              {showResetHelp ? (
                <Text
                  className="bg-muted text-muted-foreground rounded-xl p-3 text-sm leading-5"
                  accessibilityLiveRegion="polite">
                  Password reset isn’t available in this demo. Use any valid email and a non-empty
                  password to try it.
                </Text>
              ) : null}
            </View>
          ) : null}
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3 p-0">
          <Button className="h-12 rounded-xl sm:h-12" onPress={handleSubmit}>
            <Text className="text-base font-semibold">{isSignUp ? 'Next' : 'Log In'}</Text>
          </Button>
          <Text className="text-muted-foreground text-center text-xs leading-5">
            Demo only. No real account is created.
          </Text>
        </CardFooter>
      </Card>

      <View className="flex-row flex-wrap items-center justify-center gap-x-1 px-2">
        <Text className="text-muted-foreground text-sm">
          {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}
        </Text>
        <Button
          variant="link"
          role="link"
          className="h-11 px-1 sm:h-11"
          onPress={() => router.replace(isSignUp ? '/login' : '/sign-up')}>
          <Text className="text-foreground text-sm font-semibold">
            {isSignUp ? 'Log In' : 'Sign Up'}
          </Text>
        </Button>
      </View>
    </View>
  );
}
