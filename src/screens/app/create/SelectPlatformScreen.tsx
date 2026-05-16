import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius } from '../../../theme';
import { PLATFORMS } from '../../../data/gamesData';
import { PLATFORM_ICONS } from './PlatformIcons';
import type { HomeStackParamList } from '../../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'SelectPlatform'>;

const SIDE_PADDING = 20;
const GAP = 12;
const screenWidth = Dimensions.get('window').width;
const CARD_WIDTH = (screenWidth - SIDE_PADDING * 2 - GAP) / 2;

export function SelectPlatformScreen() {
  const navigation = useNavigation<Nav>();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = PLATFORMS.find((p) => p.id === selectedId) ?? null;

  const onContinue = () => {
    if (!selected) return;
    navigation.navigate('SelectGame', {
      platformId: selected.id,
      platformLabel: selected.label,
    });
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="select-platform-screen"
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerSide}
          accessibilityRole="button"
          accessibilityLabel="Close"
          testID="platform-close-btn"
        >
          <Text style={styles.closeIcon}>×</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Platform</Text>
        <View style={styles.headerSide}>
          <Text style={styles.step}>1 of 2</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {PLATFORMS.map((platform) => {
          const isSelected = platform.id === selectedId;
          const Icon = PLATFORM_ICONS[platform.icon] ?? PLATFORM_ICONS.pc;
          return (
            <TouchableOpacity
              key={platform.id}
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => setSelectedId(platform.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={platform.label}
              testID={`platform-card-${platform.id}`}
            >
              {isSelected && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
              <Icon
                size={32}
                color={isSelected ? '#ffffff' : colors.primaryLight}
              />
              <Text style={styles.cardLabel}>{platform.label}</Text>
              <Text style={styles.cardDesc}>{platform.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onContinue}
          disabled={!selected}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ disabled: !selected }}
          accessibilityLabel="Continue"
          style={[styles.continueBtn, !selected && styles.continueBtnDisabled]}
          testID="platform-continue-btn"
        >
          <Text
            style={[
              styles.continueText,
              !selected && styles.continueTextDisabled,
            ]}
          >
            Continue →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerSide: { width: 56, justifyContent: 'center' },
  closeIcon: {
    color: colors.textMuted,
    fontSize: 28,
    lineHeight: 30,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  step: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: GAP,
  },
  card: {
    width: CARD_WIDTH,
    height: 110,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { color: '#ffffff', fontSize: 12, fontWeight: '700' },
  cardLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  cardDesc: {
    color: colors.textMuted,
    fontSize: 11,
  },
  footer: {
    paddingHorizontal: SIDE_PADDING,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
  },
  continueBtn: {
    minHeight: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnDisabled: { backgroundColor: colors.surface },
  continueText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
  continueTextDisabled: { color: colors.textMuted },
});
