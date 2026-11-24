import { useEffect, useRef, useState, type PropsWithChildren } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReducedMotion } from 'react-native-reanimated';
import { AppLogo } from '@/components/AppLogo';
import { Text } from '@/components/ui/text';
import { useDemoAuth } from '@/context/DemoAuthContext';
import { theme } from '@/lib/theme';

type AuthLayoutProps = PropsWithChildren<{ showIntro?: boolean }>;

// This layout is app-specific. The form inside it uses the library's Card and inputs.
export function AuthLayout({ children, showIntro = false }: AuthLayoutProps) {
  const { hasSeenIntro, finishIntro } = useDemoAuth();
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduceMotion = useReducedMotion();
  const [playIntro] = useState(() => showIntro && !hasSeenIntro);
  const [introVisible, setIntroVisible] = useState(playIntro);
  const move = useRef(new Animated.Value(playIntro ? 0 : 1)).current;
  const reveal = useRef(new Animated.Value(playIntro ? 0 : 1)).current;
  const topPadding = height < 740 ? 24 : 48;
  const initialOffset = Math.max(0, (height - insets.top - insets.bottom - 248) / 2 - topPadding);

  useEffect(() => {
    if (!playIntro) return;

    if (reduceMotion) {
      move.setValue(1);
      reveal.setValue(1);
      setIntroVisible(false);
      finishIntro();
      return;
    }

    const introAnimation = Animated.sequence([
      Animated.delay(1500),
      Animated.timing(move, {
        toValue: 1,
        duration: 650,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]);

    introAnimation.start(({ finished }) => {
      if (finished) {
        finishIntro();
        setIntroVisible(false);
      }
    });

    return () => introAnimation.stop();
  }, [finishIntro, move, playIntro, reduceMotion, reveal]);

  useEffect(() => {
    if (introVisible || !playIntro || reduceMotion) return;
    const revealAnimation = Animated.timing(reveal, {
      toValue: 1,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: Platform.OS !== 'web',
    });
    revealAnimation.start();
    return () => revealAnimation.stop();
  }, [introVisible, playIntro, reduceMotion, reveal]);

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPadding, paddingHorizontal: width < 360 ? 16 : 24 },
          ]}
          scrollEnabled={!introVisible}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            <Animated.View
              style={[
                styles.logo,
                {
                  transform: [
                    {
                      translateY: move.interpolate({
                        inputRange: [0, 1],
                        outputRange: [initialOffset, 0],
                      }),
                    },
                    { scale: move.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] }) },
                  ],
                },
              ]}>
              <AppLogo />
            </Animated.View>

            {introVisible ? (
              <Animated.View
                style={[
                  styles.introCopy,
                  {
                    top: initialOffset + 152,
                    opacity: move.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 0, 0] }),
                    transform: [
                      {
                        translateY: move.interpolate({ inputRange: [0, 1], outputRange: [0, -24] }),
                      },
                    ],
                  },
                ]}>
                <Text variant="h3" className="text-center text-2xl font-semibold">
                  Welcome to SwapSkill
                </Text>
                <Text className="text-muted-foreground text-center text-base leading-6">
                  A little help. A fair exchange.
                </Text>
              </Animated.View>
            ) : (
              <Animated.View
                style={{
                  opacity: reveal,
                  transform: [
                    {
                      translateY: reveal.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                    },
                  ],
                }}>
                {children}
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  scroll: { flexGrow: 1, paddingBottom: 32 },
  container: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  logo: { alignItems: 'center', marginBottom: 32 },
  introCopy: { position: 'absolute', left: 0, right: 0, gap: 12 },
});
