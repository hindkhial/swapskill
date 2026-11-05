import { Stack } from 'expo-router';
import { useReducedMotion } from 'react-native-reanimated';
import { DemoRequestsProvider } from '@/context/DemoRequestsContext';

export const unstable_settings = { anchor: '(tabs)' };

export default function MainLayout() {
  const reduceMotion = useReducedMotion();

  return (
    <DemoRequestsProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: reduceMotion ? 'none' : 'slide_from_right',
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="new-request" options={{ title: 'Post a request · SwapSkill' }} />
        <Stack.Screen name="request/[id]" options={{ title: 'Request · SwapSkill' }} />
      </Stack>
    </DemoRequestsProvider>
  );
}
