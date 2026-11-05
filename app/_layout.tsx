import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { DemoAuthProvider, useDemoAuth } from '@/context/DemoAuthContext';
import { ThemeProvider } from 'expo-router/react-navigation';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useReducedMotion } from 'react-native-reanimated';
import { Uniwind } from 'uniwind';

Uniwind.setTheme('light');

export { ErrorBoundary } from 'expo-router';

function AppNavigator() {
  const { user, needsSkills } = useDemoAuth();
  const reduceMotion = useReducedMotion();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'fade',
        animationDuration: 200,
      }}>
      <Stack.Protected guard={!user} redirectTo={needsSkills ? '/skills' : '/home'}>
        <Stack.Screen name="index" options={{ title: 'SwapSkill' }} />
        <Stack.Screen name="login" options={{ title: 'Log In · SwapSkill' }} />
        <Stack.Screen name="sign-up" options={{ title: 'Sign Up · SwapSkill' }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user && needsSkills} redirectTo={user ? '/home' : '/'}>
        <Stack.Screen name="skills" options={{ title: 'Choose skills · SwapSkill' }} />
      </Stack.Protected>
      <Stack.Protected guard={!!user && !needsSkills} redirectTo={user ? '/skills' : '/'}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={NAV_THEME}>
      <DemoAuthProvider>
        <StatusBar style="dark" />
        <AppNavigator />
        <PortalHost />
      </DemoAuthProvider>
    </ThemeProvider>
  );
}
