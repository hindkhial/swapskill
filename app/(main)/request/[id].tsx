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
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { useDemoAuth } from '@/context/DemoAuthContext';
import { useDemoRequests } from '@/context/DemoRequestsContext';
import {
  REQUEST_CATEGORIES,
  validateProposal,
  type ProposalDraft,
  type ProposalErrors,
} from '@/lib/requests';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function RequestDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string | string[] }>();
  const { user } = useDemoAuth();
  const { posts, proposals, sendProposal } = useDemoRequests();
  const [proposal, setProposal] = useState<ProposalDraft>({
    offeredService: '',
    requestedInReturn: '',
  });
  const [errors, setErrors] = useState<ProposalErrors>({});
  const [saveError, setSaveError] = useState('');
  const offeredServiceRef = useRef<ComponentRef<typeof TextInput>>(null);
  const requestedInReturnRef = useRef<ComponentRef<typeof TextInput>>(null);
  const postId = Array.isArray(id) ? id[0] : id;
  const post = posts.find((item) => item.id === postId);

  if (!user) return <Redirect href="/login" />;

  const ownPost = post?.authorId === 'me';
  const category = REQUEST_CATEGORIES.find((item) => item.id === post?.categoryId);
  const sentProposal = proposals.find(
    (item) => item.direction === 'sent' && item.postId === postId
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/home');
  }

  function updateProposal(field: keyof ProposalDraft, value: string) {
    setProposal((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError('');
  }

  function validateProposalField(field: keyof ProposalDraft) {
    setErrors((current) => ({ ...current, [field]: validateProposal(proposal)[field] }));
  }

  function offerHelp() {
    const nextErrors = validateProposal(proposal);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        if (nextErrors.offeredService) offeredServiceRef.current?.focus();
        else if (nextErrors.requestedInReturn) requestedInReturnRef.current?.focus();
      });
      return;
    }
    if (!post || !sendProposal(post.id, proposal)) {
      setSaveError('Your offer could not be saved. Please try again.');
      return;
    }
    setProposal({ offeredService: '', requestedInReturn: '' });
    setErrors({});
    setSaveError('');
    Keyboard.dismiss();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
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
              <Text className="text-lg font-semibold">Request details</Text>
            </View>

            {!post ? (
              <Card className="gap-5 rounded-3xl p-6 shadow-none">
                <CardHeader className="gap-2 p-0">
                  <CardTitle className="text-2xl leading-8">Request not found</CardTitle>
                  <CardDescription className="leading-6">
                    This request isn’t available in the current demo session.
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-0">
                  <Button
                    className="h-12 w-full rounded-xl sm:h-12"
                    onPress={() => router.replace('/home')}>
                    <Text>Back to Home</Text>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <>
                <Card className="gap-6 rounded-3xl p-6 shadow-none">
                  <CardHeader className="gap-3 p-0">
                    <View className="flex-row flex-wrap gap-2">
                      <Badge variant="secondary">
                        <Text>{category?.name ?? 'Other'}</Text>
                      </Badge>
                      <Badge variant="outline">
                        <Text>{post.format}</Text>
                      </Badge>
                    </View>
                    <CardTitle className="text-2xl leading-8">{post.title}</CardTitle>
                    <CardDescription className="leading-6">By {post.authorName}</CardDescription>
                    {post.authorSkills.length > 0 ? (
                      <View className="flex-row flex-wrap gap-1.5">
                        {post.authorSkills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="skill"
                            className="max-w-full whitespace-normal">
                            <Text className="min-w-0 shrink break-words whitespace-normal">
                              {skill}
                            </Text>
                          </Badge>
                        ))}
                      </View>
                    ) : null}
                  </CardHeader>
                  <CardContent className="gap-5 p-0">
                    <Text className="text-base leading-7">{post.description}</Text>
                    <Text className="text-muted-foreground text-xs leading-5">
                      {post.example
                        ? 'Sample request for this demo. Interactions stay on this device.'
                        : 'Local demo request. Nothing has been published online.'}
                    </Text>
                  </CardContent>
                </Card>

                {ownPost ? (
                  <Card className="gap-4 rounded-3xl p-6 shadow-none">
                    <CardHeader className="gap-2 p-0">
                      <CardTitle className="text-lg leading-6">This is your request</CardTitle>
                      <CardDescription className="leading-6">
                        See your posts and offers in Requests.
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-0">
                      <Button
                        variant="outline"
                        className="h-12 w-full rounded-xl sm:h-12"
                        onPress={() =>
                          router.replace({ pathname: '/requests', params: { view: 'posts' } })
                        }>
                        <Text>View my requests</Text>
                      </Button>
                    </CardFooter>
                  </Card>
                ) : sentProposal ? (
                  <Card className="gap-5 rounded-3xl p-6 shadow-none">
                    <CardHeader className="gap-2 p-0">
                      <CardTitle className="text-lg leading-6">
                        {sentProposal.status === 'accepted'
                          ? 'Your offer was accepted'
                          : sentProposal.status === 'declined'
                            ? 'Your offer was declined'
                            : 'Your offer is saved'}
                      </CardTitle>
                      <CardDescription className="leading-6">
                        {sentProposal.status === 'pending'
                          ? 'Pending response in this demo.'
                          : 'Demo status'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="gap-3 p-0">
                      <View className="bg-muted gap-2 rounded-2xl p-4">
                        <Text className="text-sm font-semibold">You offer</Text>
                        <Text className="text-base leading-6">{sentProposal.offeredService}</Text>
                      </View>
                      <View className="bg-muted gap-2 rounded-2xl p-4">
                        <Text className="text-sm font-semibold">You ask for</Text>
                        <Text className="text-base leading-6">
                          {sentProposal.requestedInReturn}
                        </Text>
                      </View>
                      <Text className="text-muted-foreground text-xs leading-5">
                        This offer is saved locally. Nothing was sent to another person.
                      </Text>
                    </CardContent>
                    <CardFooter className="p-0">
                      <Button
                        variant="outline"
                        className="h-12 w-full rounded-xl sm:h-12"
                        onPress={() =>
                          router.push({ pathname: '/requests', params: { view: 'sent' } })
                        }>
                        <Text>View sent offers</Text>
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="gap-5 rounded-3xl p-6 shadow-none">
                    <CardHeader className="gap-2 p-0">
                      <CardTitle className="text-lg leading-6">Propose an exchange</CardTitle>
                      <CardDescription className="leading-6">
                        Explain how you’ll help and what you’d like in return.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="gap-5 p-0">
                      <View className="gap-2">
                        <Label
                          htmlFor="proposal-service"
                          nativeID="proposal-service-label"
                          onPress={() => offeredServiceRef.current?.focus()}>
                          What will you do?
                        </Label>
                        <Textarea
                          ref={offeredServiceRef}
                          nativeID="proposal-service"
                          aria-labelledby="proposal-service-label"
                          aria-invalid={!!errors.offeredService}
                          aria-describedby="proposal-service-help"
                          accessibilityLabel="What will you do?"
                          accessibilityHint={errors.offeredService || 'Use 10–300 characters.'}
                          className={cn(
                            'min-h-32 rounded-xl text-base md:text-base',
                            errors.offeredService && 'border-destructive'
                          )}
                          placeholder="e.g. I’ll design a logo for your bakery."
                          value={proposal.offeredService}
                          onChangeText={(value) => updateProposal('offeredService', value)}
                          onBlur={() => validateProposalField('offeredService')}
                          maxLength={300}
                          autoCapitalize="sentences"
                          textAlignVertical="top"
                        />
                        <Text
                          nativeID="proposal-service-help"
                          className={cn(
                            'text-xs leading-5',
                            errors.offeredService ? 'text-destructive' : 'text-muted-foreground'
                          )}
                          accessibilityLiveRegion={errors.offeredService ? 'polite' : 'none'}>
                          {errors.offeredService ||
                            '10–300 characters. Describe the service you’ll provide.'}
                        </Text>
                      </View>
                      <View className="gap-2">
                        <Label
                          htmlFor="proposal-return"
                          nativeID="proposal-return-label"
                          onPress={() => requestedInReturnRef.current?.focus()}>
                          What would you like in return?
                        </Label>
                        <Textarea
                          ref={requestedInReturnRef}
                          nativeID="proposal-return"
                          aria-labelledby="proposal-return-label"
                          aria-invalid={!!errors.requestedInReturn}
                          aria-describedby="proposal-return-help"
                          accessibilityLabel="What would you like in return?"
                          accessibilityHint={errors.requestedInReturn || 'Use 10–300 characters.'}
                          className={cn(
                            'min-h-32 rounded-xl text-base md:text-base',
                            errors.requestedInReturn && 'border-destructive'
                          )}
                          placeholder="e.g. I’d like a custom birthday cake in return."
                          value={proposal.requestedInReturn}
                          onChangeText={(value) => updateProposal('requestedInReturn', value)}
                          onBlur={() => validateProposalField('requestedInReturn')}
                          maxLength={300}
                          autoCapitalize="sentences"
                          textAlignVertical="top"
                        />
                        <Text
                          nativeID="proposal-return-help"
                          className={cn(
                            'text-xs leading-5',
                            errors.requestedInReturn ? 'text-destructive' : 'text-muted-foreground'
                          )}
                          accessibilityLiveRegion={errors.requestedInReturn ? 'polite' : 'none'}>
                          {errors.requestedInReturn ||
                            '10–300 characters. Describe what you’re asking for.'}
                        </Text>
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
                      <Button className="h-12 rounded-xl sm:h-12" onPress={offerHelp}>
                        <Text className="text-base font-semibold">Offer to help</Text>
                      </Button>
                      <Text className="text-muted-foreground text-center text-xs leading-5">
                        Demo only. Your offer won’t be sent to anyone.
                      </Text>
                    </CardFooter>
                  </Card>
                )}
              </>
            )}
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
