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
import { Redirect } from 'expo-router';
import { X } from 'lucide-react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useDemoAuth } from '@/context/DemoAuthContext';
import {
  SKILL_CATEGORIES,
  cleanSkillLabel,
  filterSkillCategories,
  findKnownSkill,
  normalizeProfileSkills,
  skillKey,
  type SkillCategory,
} from '@/lib/skills';
import { theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

export default function SkillsScreen() {
  const { user, needsSkills, completeSkills, endDemo } = useDemoAuth();
  const [selected, setSelected] = useState(() => normalizeProfileSkills(user?.skills ?? []));
  const [customSkills, setCustomSkills] = useState(() =>
    normalizeProfileSkills(user?.skills ?? []).filter((skill) => !findKnownSkill(skill))
  );
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [customDraft, setCustomDraft] = useState('');
  const [customError, setCustomError] = useState('');
  const [notice, setNotice] = useState('');
  const searchRef = useRef<ComponentRef<typeof TextInput>>(null);
  const customRef = useRef<ComponentRef<typeof TextInput>>(null);

  if (!user) return <Redirect href="/login" />;
  if (!needsSkills) return <Redirect href="/home" />;

  const selectedKeys = new Set(selected.map(skillKey));
  const matchingCustomSkills =
    categoryId === 'all'
      ? customSkills.filter((skill) => skillKey(skill).includes(skillKey(query)))
      : [];
  const groups: SkillCategory[] = [...filterSkillCategories(query, categoryId)];
  if (matchingCustomSkills.length > 0) {
    groups.push({ id: 'custom', name: 'Your additions', skills: matchingCustomSkills });
  }

  function setSkillSelected(skill: string, checked: boolean) {
    setSelected((current) =>
      checked
        ? normalizeProfileSkills([...current, skill])
        : current.filter((item) => skillKey(item) !== skillKey(skill))
    );
    setNotice('');
  }

  function addCustomSkill() {
    const cleaned = cleanSkillLabel(customDraft);
    if (!cleaned) {
      setCustomError('Enter the skill you would like to add.');
      customRef.current?.focus();
      return;
    }
    if (cleaned.length > 60) {
      setCustomError('Keep your skill name to 60 characters or fewer.');
      customRef.current?.focus();
      return;
    }

    const knownSkill = findKnownSkill(cleaned);
    const existingCustom = customSkills.find((skill) => skillKey(skill) === skillKey(cleaned));
    const label = knownSkill ?? existingCustom ?? cleaned;
    if (!knownSkill && !existingCustom) {
      setCustomSkills((current) => [...current, label]);
    }
    setSelected((current) => normalizeProfileSkills([...current, label]));
    setNotice(
      selectedKeys.has(skillKey(label))
        ? `${label} is already selected.`
        : `${label} was added to your skills.`
    );
    setCustomDraft('');
    setCustomError('');
    setQuery('');
    setCategoryId('all');
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
          <View style={styles.content} className="gap-6">
            <View className="gap-3">
              <View className="flex-row items-center justify-between gap-3">
                <Text className="text-muted-foreground text-xs font-semibold tracking-widest">
                  STEP 2 OF 2
                </Text>
                <Button variant="ghost" className="h-11 px-2 sm:h-11" onPress={endDemo}>
                  <Text className="text-muted-foreground text-sm">Cancel setup</Text>
                </Button>
              </View>
              <Text variant="h1" className="text-left text-3xl leading-9 font-bold">
                What can you offer?
              </Text>
              <Text className="text-muted-foreground text-base leading-6">
                Choose the skills you can use to help someone. Pick at least one.
              </Text>
            </View>

            <View className="gap-3">
              <Label htmlFor="skills-search" onPress={() => searchRef.current?.focus()}>
                Search skills
              </Label>
              <View className="relative">
                <Input
                  ref={searchRef}
                  nativeID="skills-search"
                  accessibilityLabel="Search skills or categories"
                  placeholder="Search skills or categories"
                  className="bg-card h-12 rounded-xl pr-14 text-base sm:h-12 md:text-base"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-12 w-12 rounded-xl sm:h-12 sm:w-12"
                  accessibilityLabel="Clear search"
                  disabled={!query}
                  onPress={() => setQuery('')}>
                  <X size={18} color={theme.colors.mutedForeground} />
                </Button>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.categories}>
                {[{ id: 'all', name: 'All' }, ...SKILL_CATEGORIES].map((category) => (
                  <Button
                    key={category.id}
                    variant={categoryId === category.id ? 'default' : 'outline'}
                    className="h-11 rounded-full px-4 sm:h-11"
                    accessibilityLabel={`Filter by ${category.name}`}
                    accessibilityState={{ selected: categoryId === category.id }}
                    onPress={() => setCategoryId(category.id)}>
                    <Text className="text-sm">{category.name}</Text>
                  </Button>
                ))}
              </ScrollView>
            </View>

            {selected.length > 0 ? (
              <View className="gap-3">
                <Text className="text-sm font-semibold">Your skills · {selected.length}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {selected.map((skill) => (
                    <Badge
                      key={skillKey(skill)}
                      variant="secondary"
                      className="max-w-full gap-0 py-0 pr-0 pl-3">
                      <Text className="max-w-[220px] shrink text-sm" numberOfLines={1}>
                        {skill}
                      </Text>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-full sm:h-11 sm:w-11"
                        accessibilityLabel={`Remove ${skill}`}
                        onPress={() => setSkillSelected(skill, false)}>
                        <X size={15} color={theme.colors.navy} />
                      </Button>
                    </Badge>
                  ))}
                </View>
              </View>
            ) : null}

            {groups.map((group) => (
              <Card key={group.id} className="gap-2 rounded-2xl p-4 shadow-none">
                <CardHeader className="p-0">
                  <CardTitle className="text-base leading-6">{group.name}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {group.skills.map((skill, index) => {
                    const checked = selectedKeys.has(skillKey(skill));
                    const inputId = `skill-${group.id}-${index}`;
                    return (
                      <View
                        key={skillKey(skill)}
                        className={cn(
                          'min-h-12 flex-row items-center gap-3',
                          index < group.skills.length - 1 && 'border-border/60 border-b'
                        )}>
                        <Checkbox
                          nativeID={inputId}
                          checked={checked}
                          onCheckedChange={(nextChecked) => setSkillSelected(skill, nextChecked)}
                          aria-labelledby={`${inputId}-label`}
                          accessibilityLabel={skill}
                          className="size-5 rounded-md"
                          hitSlop={12}
                        />
                        <View className="flex-1">
                          <Label
                            nativeID={`${inputId}-label`}
                            htmlFor={inputId}
                            className="flex-1 py-3 text-sm leading-6"
                            onPress={Platform.select({
                              native: () => setSkillSelected(skill, !checked),
                            })}>
                            {skill}
                          </Label>
                        </View>
                      </View>
                    );
                  })}
                </CardContent>
              </Card>
            ))}

            <Card className="gap-4 rounded-2xl p-4 shadow-none">
              <CardHeader className="gap-1 p-0">
                <CardTitle className="text-base leading-6">
                  {groups.length === 0 ? 'No matching skills yet' : 'Missing a skill?'}
                </CardTitle>
                <Text className="text-muted-foreground text-sm leading-5">
                  Add your own skill to include it in your profile.
                </Text>
              </CardHeader>
              <CardContent className="gap-3 p-0">
                <Label htmlFor="custom-skill" onPress={() => customRef.current?.focus()}>
                  Your skill
                </Label>
                <Input
                  ref={customRef}
                  nativeID="custom-skill"
                  accessibilityLabel="Your custom skill"
                  accessibilityHint={customError || 'Up to 60 characters.'}
                  aria-invalid={!!customError}
                  aria-describedby={customError ? 'custom-skill-error' : undefined}
                  className={cn(
                    'bg-background h-12 rounded-xl text-base sm:h-12 md:text-base',
                    customError && 'border-destructive'
                  )}
                  placeholder="e.g. Pottery"
                  value={customDraft}
                  onChangeText={(value) => {
                    setCustomDraft(value);
                    setCustomError('');
                    setNotice('');
                  }}
                  maxLength={60}
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  onSubmitEditing={addCustomSkill}
                />
                {customError ? (
                  <Text
                    nativeID="custom-skill-error"
                    className="text-destructive text-xs leading-5"
                    accessibilityLiveRegion="polite">
                    {customError}
                  </Text>
                ) : null}
                <Button
                  variant="outline"
                  className="h-12 rounded-xl sm:h-12"
                  onPress={addCustomSkill}>
                  <Text>Add skill</Text>
                </Button>
                {notice ? (
                  <Text
                    className="text-muted-foreground text-sm leading-5"
                    accessibilityLiveRegion="polite">
                    {notice}
                  </Text>
                ) : null}
              </CardContent>
            </Card>
          </View>
        </ScrollView>

        <View className="border-border bg-card border-t" style={styles.footer}>
          <View style={styles.content} className="gap-3">
            <Text
              className="text-muted-foreground text-center text-sm"
              accessibilityLiveRegion="polite">
              {selected.length === 0
                ? 'Choose at least one skill to continue.'
                : `${selected.length} ${selected.length === 1 ? 'skill' : 'skills'} selected`}
            </Text>
            <Button
              className="h-12 rounded-xl sm:h-12"
              disabled={selected.length === 0}
              onPress={() => {
                Keyboard.dismiss();
                completeSkills(normalizeProfileSkills(selected));
              }}>
              <Text className="text-base font-semibold">Continue</Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  content: { width: '100%', maxWidth: 560, alignSelf: 'center' },
  categories: { gap: 8, paddingVertical: 3 },
  footer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 16 },
});
