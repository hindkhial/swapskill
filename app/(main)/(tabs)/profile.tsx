import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useDemoAuth } from '@/context/DemoAuthContext';
import { makeInitials } from '@/lib/requests';
import { theme } from '@/lib/theme';

export default function ProfileScreen() {
  const { user, endDemo } = useDemoAuth();
  if (!user) return null;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Text variant="h1" className="text-left text-3xl leading-9 font-bold">
            Your profile
          </Text>
          <Text className="text-muted-foreground leading-6">What you bring to the exchange.</Text>
        </View>
        <Card className="gap-4 rounded-2xl p-5 shadow-none">
          <View className="flex-row items-center gap-4">
            <Avatar alt={user.name} className="size-16">
              <AvatarFallback className="bg-primary">
                <Text className="text-xl font-bold">{makeInitials(user.name)}</Text>
              </AvatarFallback>
            </Avatar>
            <View className="min-w-0 flex-1 gap-1">
              <Text className="text-xl font-semibold">{user.name}</Text>
              <Text className="text-muted-foreground text-sm">{user.email}</Text>
            </View>
          </View>
        </Card>
        <Card className="gap-4 rounded-2xl py-5 shadow-none">
          <CardHeader className="gap-1 px-5">
            <CardTitle className="text-lg leading-6">Skills you offer</CardTitle>
            <Text className="text-muted-foreground text-sm leading-6">
              Use these skills to help someone with a request.
            </Text>
          </CardHeader>
          <CardContent className="px-5">
            {user.skills.length > 0 ? (
              <View className="flex-row flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="max-w-full rounded-lg px-3 py-2 whitespace-normal">
                    <Text className="min-w-0 shrink text-sm">{skill}</Text>
                  </Badge>
                ))}
              </View>
            ) : (
              <Text className="text-muted-foreground text-sm leading-6">
                No skills in this demo profile yet. The sign-up flow lets you choose them.
              </Text>
            )}
          </CardContent>
        </Card>
        <View className="gap-4 pt-2">
          <Text className="text-muted-foreground text-sm leading-6">
            This is a demo profile. Your skills, posts, and offers reset when you reload or end the
            demo. Nothing is sent to other people.
          </Text>
          <Button variant="outline" className="bg-card h-12 rounded-xl sm:h-12" onPress={endDemo}>
            <Text>End demo</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 32,
    gap: 24,
  },
});
