import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';

interface Props {
  children: React.ReactNode;
  /** Disable the default horizontal + vertical padding (e.g. for hero images). */
  noPadding?: boolean;
  /** Disable scrolling — useful for pages that manage their own scroll. */
  noScroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ScreenContainer({
  children,
  noPadding = false,
  noScroll = false,
  style,
  contentStyle,
  testID,
}: Props) {
  if (noScroll) {
    return (
      <SafeAreaView
        style={[styles.safe, style]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.noScrollInner} testID={testID}>
          {children}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, style]}
      edges={['top', 'left', 'right']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          noPadding ? styles.contentNoPad : styles.content,
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        testID={testID}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  contentNoPad: { flexGrow: 1 },
  noScrollInner: { flex: 1 },
});
