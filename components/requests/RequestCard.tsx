import { Link } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import { View } from 'react-native';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Text } from '@/components/ui/text';
import { makeInitials, REQUEST_CATEGORIES, type RequestPost } from '@/lib/requests';
import { theme } from '@/lib/theme';

// A SwapSkill post composed from the official React Native Reusables primitives.
export function RequestCard({ post, offered = false }: { post: RequestPost; offered?: boolean }) {
  const category = REQUEST_CATEGORIES.find((item) => item.id === post.categoryId)?.name;

  return (
    <Card className="gap-4 rounded-2xl py-5 shadow-none">
      <CardHeader className="gap-4 px-5">
        <View className="flex-row items-start gap-3">
          <Avatar alt={post.authorName} className="size-10">
            <AvatarFallback className="bg-secondary">
              <Text className="text-sm font-semibold">{makeInitials(post.authorName)}</Text>
            </AvatarFallback>
          </Avatar>
          <View className="min-w-0 flex-1 gap-2">
            <Text className="text-sm font-semibold">
              {post.authorId === 'me' ? 'You' : post.authorName}
            </Text>
            {post.authorSkills.length > 0 ? (
              <View className="flex-row flex-wrap gap-1.5">
                {post.authorSkills.map((skill) => (
                  <Badge key={skill} variant="skill" className="max-w-full whitespace-normal">
                    <Text className="min-w-0 shrink break-words whitespace-normal">{skill}</Text>
                  </Badge>
                ))}
              </View>
            ) : (
              <Text className="text-muted-foreground text-xs">No skills added yet</Text>
            )}
          </View>
          {offered ? (
            <Badge variant="secondary">
              <Text>Offer sent</Text>
            </Badge>
          ) : null}
        </View>
        <CardTitle className="text-xl leading-7">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 px-5">
        <Text className="text-muted-foreground text-sm leading-6">{post.description}</Text>
      </CardContent>
      <View className="px-5">
        <Separator />
      </View>
      <CardFooter className="flex-wrap justify-between gap-2 px-5">
        <View className="gap-1.5">
          <Badge
            variant="secondary"
            className="max-w-full self-start rounded-md border-0 px-2.5 py-1.5">
            <Text className="text-xs">{category}</Text>
          </Badge>
          <Text className="text-muted-foreground text-xs">
            {post.example ? 'Example post' : 'Your request'}
          </Text>
        </View>
        <Link href={{ pathname: '/request/[id]', params: { id: post.id } }} asChild>
          <Button
            variant="ghost"
            className="h-11 gap-1.5 rounded-xl px-3 sm:h-11"
            accessibilityLabel={`View request: ${post.title}`}>
            <Text className="text-sm font-semibold">View request</Text>
            <ArrowUpRight size={16} color={theme.colors.navy} />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
