import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { RequestCard } from '@/components/requests/RequestCard';
import { useDemoRequests } from '@/context/DemoRequestsContext';
import { makeInitials, type Proposal } from '@/lib/requests';
import { theme } from '@/lib/theme';

export default function RequestsScreen() {
  const { posts, proposals, respondToProposal } = useDemoRequests();
  const params = useLocalSearchParams<{ view?: string }>();
  const router = useRouter();
  const activeView = params.view === 'received' || params.view === 'sent' ? params.view : 'posts';
  const ownPosts = posts.filter((post) => post.authorId === 'me');
  const received = proposals.filter((proposal) => proposal.direction === 'received');
  const sent = proposals.filter((proposal) => proposal.direction === 'sent');

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View className="gap-2">
          <Text variant="h1" className="text-left text-3xl leading-9 font-bold">
            Your requests
          </Text>
          <Text className="text-muted-foreground leading-6">
            Keep track of the help you ask for and offer.
          </Text>
        </View>
        <Tabs
          value={activeView}
          onValueChange={(view) => router.setParams({ view })}
          className="gap-5">
          <TabsList className="bg-secondary h-auto w-full rounded-xl p-1">
            <TabsTrigger value="posts" className="min-h-11 flex-1 rounded-lg px-1">
              <Text className="text-sm">My posts</Text>
            </TabsTrigger>
            <TabsTrigger value="received" className="min-h-11 flex-1 rounded-lg px-1">
              <Text className="text-sm">Received</Text>
            </TabsTrigger>
            <TabsTrigger value="sent" className="min-h-11 flex-1 rounded-lg px-1">
              <Text className="text-sm">Sent</Text>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="gap-4">
            <View className="flex-row flex-wrap items-center justify-between gap-2">
              <Text className="text-sm font-semibold">
                {ownPosts.length} {ownPosts.length === 1 ? 'request' : 'requests'} posted
              </Text>
              <Link href="/new-request" asChild>
                <Button className="h-11 gap-1.5 rounded-xl sm:h-11">
                  <Plus size={16} color={theme.colors.navy} />
                  <Text>New request</Text>
                </Button>
              </Link>
            </View>
            {ownPosts.length > 0 ? (
              ownPosts.map((post) => <RequestCard key={post.id} post={post} />)
            ) : (
              <EmptyRequests
                title="What could you use a hand with?"
                description="Describe what you need. Other people can respond with an offer and tell you what they would like in exchange."
              />
            )}
          </TabsContent>
          <TabsContent value="received" className="gap-4">
            <Text className="text-muted-foreground text-sm leading-6">
              Offers responding to your requests. This sample offer lets you try accepting or
              declining a proposed exchange.
            </Text>
            {received.length > 0 ? (
              received.map((proposal) => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onRespond={(status) => respondToProposal(proposal.id, status)}
                />
              ))
            ) : (
              <EmptyRequests
                title="No offers received"
                description="When someone responds to your request, their offer will appear here."
              />
            )}
          </TabsContent>
          <TabsContent value="sent" className="gap-4">
            <Text className="text-muted-foreground text-sm leading-6">
              Offers you have made to help with a community request.
            </Text>
            {sent.length > 0 ? (
              sent.map((proposal) => <ProposalCard key={proposal.id} proposal={proposal} />)
            ) : (
              <EmptyRequests
                title="Your next swap starts with a hello"
                description="Browse the feed and offer to help with a request that fits your skills.">
                <Link href="/home" asChild>
                  <Button variant="outline" className="h-11 rounded-xl sm:h-11">
                    <Text>Browse requests</Text>
                  </Button>
                </Link>
              </EmptyRequests>
            )}
          </TabsContent>
        </Tabs>
        <Text className="text-muted-foreground text-center text-xs leading-5">
          Demo only · No requests or messages are sent to other people.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function EmptyRequests({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <Card className="items-center gap-3 rounded-2xl px-5 py-8 shadow-none">
      <Text className="text-center text-lg font-semibold">{title}</Text>
      <Text className="text-muted-foreground text-center text-sm leading-6">{description}</Text>
      {children}
    </Card>
  );
}

function ProposalCard({
  proposal,
  onRespond,
}: {
  proposal: Proposal;
  onRespond?: (status: 'accepted' | 'declined') => void;
}) {
  const statusLabel =
    proposal.status === 'pending'
      ? 'Pending'
      : proposal.status === 'accepted'
        ? 'Accepted'
        : 'Declined';
  return (
    <Card className="gap-4 rounded-2xl py-5 shadow-none">
      <CardHeader className="gap-4 px-5">
        <View className="flex-row items-center gap-3">
          <Avatar alt={proposal.personName} className="size-10">
            <AvatarFallback>
              <Text className="text-sm font-semibold">{makeInitials(proposal.personName)}</Text>
            </AvatarFallback>
          </Avatar>
          <View className="min-w-0 flex-1 gap-1">
            <Text className="text-sm font-semibold">
              {proposal.direction === 'sent' ? `To ${proposal.personName}` : proposal.personName}
            </Text>
            <Text className="text-muted-foreground text-xs">
              {proposal.example
                ? proposal.direction === 'received'
                  ? 'Sample offer'
                  : 'Offer on an example post'
                : 'Demo offer'}
            </Text>
          </View>
          <Badge variant="secondary">
            <Text>{statusLabel}</Text>
          </Badge>
        </View>
        <CardTitle className="text-xl leading-7">{proposal.title}</CardTitle>
      </CardHeader>
      <CardContent className="gap-4 px-5">
        <View className="gap-1">
          <Text className="text-xs font-semibold">
            {proposal.direction === 'sent' ? 'YOU OFFER' : 'THEY OFFER'}
          </Text>
          <Text className="text-muted-foreground text-sm leading-6">{proposal.offeredService}</Text>
        </View>
        <View className="bg-secondary/60 gap-1 rounded-xl p-3">
          <Text className="text-xs font-semibold">
            {proposal.direction === 'sent' ? 'YOU ASK FOR IN RETURN' : 'THEY ASK FOR IN RETURN'}
          </Text>
          <Text className="text-sm leading-5">{proposal.requestedInReturn}</Text>
        </View>
        {proposal.status !== 'pending' ? (
          <Text accessibilityLiveRegion="polite" className="text-muted-foreground text-sm">
            {statusLabel} in this demo. No notification was sent.
          </Text>
        ) : null}
      </CardContent>
      {onRespond && proposal.status === 'pending' ? (
        <CardFooter className="gap-3 px-5">
          <Button className="h-11 flex-1 rounded-xl sm:h-11" onPress={() => onRespond('accepted')}>
            <Text>Accept</Text>
          </Button>
          <Button
            variant="outline"
            className="h-11 flex-1 rounded-xl sm:h-11"
            onPress={() => onRespond('declined')}>
            <Text>Decline</Text>
          </Button>
        </CardFooter>
      ) : null}
    </Card>
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
