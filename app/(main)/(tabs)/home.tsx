import { useState } from 'react';
import { FlatList, Keyboard, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Plus, Search, X } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { RequestCard } from '@/components/requests/RequestCard';
import { AppLogo } from '@/components/AppLogo';
import { useDemoRequests } from '@/context/DemoRequestsContext';
import { filterRequests, REQUEST_CATEGORIES } from '@/lib/requests';
import { theme } from '@/lib/theme';

export default function HomeScreen() {
  const { posts, proposals } = useDemoRequests();
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const filtered = filterRequests(posts, query, categoryId);
  const offeredPostIds = new Set(
    proposals.filter((item) => item.direction === 'sent').map((item) => item.postId)
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <FlatList
        data={filtered}
        keyExtractor={(post) => post.id}
        renderItem={({ item }) => <RequestCard post={item} offered={offeredPostIds.has(item.id)} />}
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={PostSpacing}
        ListHeaderComponent={
          <View className="gap-5 pb-5">
            <View className="flex-row flex-wrap items-center justify-between gap-3">
              <AppLogo compact />
              <Link href="/new-request" asChild>
                <Button className="h-11 gap-1.5 rounded-xl px-3 sm:h-11">
                  <Plus size={17} color={theme.colors.navy} />
                  <Text className="text-sm font-semibold">Post a request</Text>
                </Button>
              </Link>
            </View>
            <View className="gap-2">
              <Text variant="h1" className="text-left text-2xl leading-8 font-bold">
                Community requests
              </Text>
              <View className="flex-row flex-wrap items-center justify-between gap-2">
                <Text className="text-muted-foreground text-sm leading-5">
                  A service for a service.
                </Text>
                <Text className="text-muted-foreground text-xs" accessibilityLiveRegion="polite">
                  {filtered.length} {filtered.length === 1 ? 'post' : 'posts'}
                </Text>
              </View>
            </View>
            <View className="gap-3">
              <View className="relative justify-center">
                <Input
                  accessibilityLabel="Search requests"
                  placeholder="What can you help with?"
                  value={query}
                  onChangeText={setQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="search"
                  onSubmitEditing={Keyboard.dismiss}
                  className="bg-card h-12 rounded-xl pr-12 pl-11 text-base sm:h-12 md:text-base"
                />
                <View pointerEvents="none" className="absolute left-3.5">
                  <Search size={18} color={theme.colors.mutedForeground} />
                </View>
                {query ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 h-12 w-12 sm:h-12 sm:w-12"
                    accessibilityLabel="Clear request search"
                    onPress={() => setQuery('')}>
                    <X size={17} color={theme.colors.mutedForeground} />
                  </Button>
                ) : null}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.categories}>
                {[{ id: 'all', name: 'All requests' }, ...REQUEST_CATEGORIES].map((category) => (
                  <Button
                    key={category.id}
                    variant={categoryId === category.id ? 'default' : 'outline'}
                    className="h-11 rounded-full px-4 shadow-none sm:h-11"
                    accessibilityLabel={`Show ${category.name}`}
                    accessibilityState={{ selected: categoryId === category.id }}
                    onPress={() => setCategoryId(category.id)}>
                    <Text className="text-sm">{category.name}</Text>
                  </Button>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="border-border bg-card items-center gap-3 rounded-2xl border px-5 py-8">
            <Text className="text-lg font-semibold">No requests found</Text>
            <Text className="text-muted-foreground text-center text-sm leading-6">
              Try another skill or view all categories.
            </Text>
            <Button
              variant="outline"
              className="h-11 rounded-xl sm:h-11"
              onPress={() => {
                setQuery('');
                setCategoryId('all');
              }}>
              <Text>Clear filters</Text>
            </Button>
          </View>
        }
        ListFooterComponent={
          <Text className="text-muted-foreground pt-6 text-center text-xs leading-5">
            Demo community · Posts and offers stay on this device until reload.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

function PostSpacing() {
  return <View style={{ height: 16 }} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
  },
  categories: { gap: 8, paddingVertical: 2 },
});
