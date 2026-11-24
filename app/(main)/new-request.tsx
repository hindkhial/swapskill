import { useRef, useState, type ComponentRef } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

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
import { Textarea } from '@/components/ui/textarea';
import { useDemoAuth } from '@/context/DemoAuthContext';
import { useDemoRequests } from '@/context/DemoRequestsContext';
import {
  REQUEST_CATEGORIES,
  validateRequest,
  type RequestDraft,
  type RequestErrors,
} from '@/lib/requests';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function NewRequestScreen() {
  const router = useRouter();
  const { user } = useDemoAuth();
  const { createRequest } = useDemoRequests();
  const [draft, setDraft] = useState<RequestDraft>({
    title: '',
    description: '',
    categoryId: '',
    format: 'Remote',
  });
  const [errors, setErrors] = useState<RequestErrors>({});
  const [saveError, setSaveError] = useState('');
  const titleRef = useRef<ComponentRef<typeof TextInput>>(null);
  const descriptionRef = useRef<ComponentRef<typeof TextInput>>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  if (!user) return <Redirect href="/login" />;

  function updateField<Key extends keyof RequestDraft>(field: Key, value: RequestDraft[Key]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError('');
  }

  function validateField(field: keyof RequestDraft) {
    setErrors((current) => ({ ...current, [field]: validateRequest(draft)[field] }));
  }

  function postRequest() {
    const nextErrors = validateRequest(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        if (nextErrors.title) titleRef.current?.focus();
        else if (nextErrors.categoryId) scrollRef.current?.scrollTo({ y: 0, animated: false });
        else if (nextErrors.description) descriptionRef.current?.focus();
      });
      return;
    }

    const id = createRequest(draft);
    if (!id) {
      setSaveError('Your request could not be saved. Please try again.');
      return;
    }
    Keyboard.dismiss();
    router.replace({ pathname: '/requests', params: { view: 'posts' } });
  }

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>
          <View style={styles.content} className="gap-5">
            <View className="flex-row items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-full sm:h-11 sm:w-11"
                accessibilityLabel="Back"
                onPress={goBack}>
                <ArrowLeft size={22} color={theme.colors.navy} />
              </Button>
              <Text className="text-lg font-semibold">New request</Text>
            </View>

            <Card className="gap-6 rounded-3xl p-6 shadow-none">
              <CardHeader className="gap-2 p-0">
                <CardTitle className="text-2xl leading-8">What do you need?</CardTitle>
                <CardDescription className="leading-6">
                  Describe the service you need. Others can propose an exchange.
                </CardDescription>
              </CardHeader>

              <CardContent className="gap-5 p-0">
                <View className="gap-2">
                  <Label
                    htmlFor="request-title"
                    nativeID="request-title-label"
                    onPress={() => titleRef.current?.focus()}>
                    Request title
                  </Label>
                  <Input
                    ref={titleRef}
                    nativeID="request-title"
                    aria-labelledby="request-title-label"
                    aria-invalid={!!errors.title}
                    aria-describedby={errors.title ? 'request-title-error' : undefined}
                    accessibilityLabel="Request title"
                    accessibilityHint={errors.title}
                    className={cn(
                      'h-12 rounded-xl text-base sm:h-12 md:text-base',
                      errors.title && 'border-destructive'
                    )}
                    placeholder="e.g. Help me fix my bicycle"
                    value={draft.title}
                    onChangeText={(value) => updateField('title', value)}
                    onBlur={() => validateField('title')}
                    maxLength={80}
                    autoCapitalize="sentences"
                    returnKeyType="next"
                    submitBehavior="submit"
                    onSubmitEditing={() => descriptionRef.current?.focus()}
                  />
                  {errors.title ? (
                    <Text
                      nativeID="request-title-error"
                      className="text-destructive text-xs leading-5"
                      accessibilityLiveRegion="polite">
                      {errors.title}
                    </Text>
                  ) : null}
                </View>

                <View className="gap-3">
                  <Label nativeID="request-category-label">Category</Label>
                  <View
                    className="flex-row flex-wrap gap-2"
                    aria-labelledby="request-category-label">
                    {REQUEST_CATEGORIES.map((category) => (
                      <Button
                        key={category.id}
                        variant={draft.categoryId === category.id ? 'default' : 'outline'}
                        className="h-11 rounded-full px-3 sm:h-11"
                        accessibilityLabel={`Category: ${category.name}`}
                        accessibilityState={{ selected: draft.categoryId === category.id }}
                        onPress={() => updateField('categoryId', category.id)}>
                        <Text className="text-sm">{category.name}</Text>
                      </Button>
                    ))}
                  </View>
                  {errors.categoryId ? (
                    <Text
                      className="text-destructive text-xs leading-5"
                      accessibilityLiveRegion="polite">
                      {errors.categoryId}
                    </Text>
                  ) : null}
                </View>

                <View className="gap-2">
                  <Label
                    htmlFor="request-description"
                    nativeID="request-description-label"
                    onPress={() => descriptionRef.current?.focus()}>
                    Description
                  </Label>
                  <Textarea
                    ref={descriptionRef}
                    nativeID="request-description"
                    aria-labelledby="request-description-label"
                    aria-invalid={!!errors.description}
                    aria-describedby="request-description-help"
                    accessibilityLabel="Request description"
                    accessibilityHint={
                      errors.description || 'Use 2–3 sentences, at least 20 characters.'
                    }
                    className={cn(
                      'min-h-32 rounded-xl text-base md:text-base',
                      errors.description && 'border-destructive'
                    )}
                    placeholder="Tell us what you need help with and any useful details."
                    value={draft.description}
                    onChangeText={(value) => updateField('description', value)}
                    onBlur={() => validateField('description')}
                    maxLength={500}
                    textAlignVertical="top"
                    autoCapitalize="sentences"
                  />
                  <Text
                    nativeID="request-description-help"
                    className={cn(
                      'text-xs leading-5',
                      errors.description ? 'text-destructive' : 'text-muted-foreground'
                    )}
                    accessibilityLiveRegion={errors.description ? 'polite' : 'none'}>
                    {errors.description || 'Aim for 2–3 sentences. 20–500 characters.'}
                  </Text>
                </View>

                <View className="gap-3">
                  <Label nativeID="request-format-label">How will it happen?</Label>
                  <View className="flex-row gap-2" aria-labelledby="request-format-label">
                    {(['Remote', 'In person'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={draft.format === format ? 'default' : 'outline'}
                        className="h-12 flex-1 rounded-xl px-3 sm:h-12"
                        accessibilityState={{ selected: draft.format === format }}
                        onPress={() => updateField('format', format)}>
                        <Text>{format}</Text>
                      </Button>
                    ))}
                  </View>
                  {errors.format ? (
                    <Text
                      className="text-destructive text-xs leading-5"
                      accessibilityLiveRegion="polite">
                      {errors.format}
                    </Text>
                  ) : null}
                </View>
              </CardContent>

              <CardFooter className="flex-col items-stretch gap-3 p-0">
                {saveError ? (
                  <Text
                    className="text-destructive text-sm leading-5"
                    accessibilityLiveRegion="polite">
                    {saveError}
                  </Text>
                ) : null}
                <Button className="h-12 rounded-xl sm:h-12" onPress={postRequest}>
                  <Text className="text-base font-semibold">Post request</Text>
                </Button>
                <Text className="text-muted-foreground text-center text-xs leading-5">
                  Saved only in this demo. Nothing is published online.
                </Text>
              </CardFooter>
            </Card>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 32 },
  content: { width: '100%', maxWidth: 640, alignSelf: 'center' },
});
