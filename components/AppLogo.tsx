import { Image, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { theme } from '@/lib/theme';

const LOGO_SOURCE = require('@/assets/branding/swapskill-mark-source.png');

// Visible bounds of the supplied 1024 × 1223 PNG. The view hides its transparent
// margins while leaving the original artwork and image file unchanged.
const MARK = { canvasWidth: 1024, canvasHeight: 1223, x: 247, y: 298, width: 453, height: 501 };

export function AppLogo({ compact = false }: { compact?: boolean }) {
  const markHeight = compact ? 28 : 72;
  const scale = markHeight / MARK.height;
  const wordmarkStyle = compact ? styles.compactWordmark : styles.wordmark;

  return (
    <View accessible accessibilityRole="image" accessibilityLabel="SwapSkill" style={styles.logo}>
      <View style={compact ? styles.compactLockup : styles.lockup}>
        <View style={{ width: MARK.width * scale, height: markHeight, overflow: 'hidden' }}>
          <Image
            source={LOGO_SOURCE}
            accessible={false}
            resizeMode="contain"
            style={{
              position: 'absolute',
              width: MARK.canvasWidth * scale,
              height: MARK.canvasHeight * scale,
              left: -MARK.x * scale,
              top: -MARK.y * scale,
            }}
          />
        </View>
        <Text style={[wordmarkStyle, { color: theme.colors.brandNavy }]}>
          Swap
          <Text style={[wordmarkStyle, { color: theme.colors.brandBlue }]}>Skill</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center' },
  lockup: { alignItems: 'center', gap: 12 },
  compactLockup: { alignItems: 'center', flexDirection: 'row', gap: 8 },
  compactWordmark: { fontSize: 20, lineHeight: 28, fontWeight: '800', letterSpacing: -0.8 },
  wordmark: { fontSize: 32, lineHeight: 40, fontWeight: '800', letterSpacing: -1.2 },
});
