import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../../theme';
import {
  ChallengeSvg,
  TournamentSvg,
  FaznSpecialsSvg,
  HighlightSvg,
  LeagueSvg,
  CloseDrawerSvg,
} from './CreateDrawerIcons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DRAWER_HEIGHT = SCREEN_HEIGHT * 0.62;

interface CreateOption {
  id: string;
  label: string;
  description: string;
  Icon: React.FC<{ size?: number }>;
  accent: string;
}

const OPTIONS: CreateOption[] = [
  {
    id: 'challenge',
    label: 'Create Challenge',
    description: 'Challenge a friend or rival 1v1',
    Icon: ChallengeSvg,
    accent: '#7c3aed',
  },
  {
    id: 'tournament',
    label: 'Create Tournament',
    description: 'Organise a bracket for your squad',
    Icon: TournamentSvg,
    accent: '#0ea5e9',
  },
  {
    id: 'fazn_special',
    label: 'FAZN Specials',
    description: 'Join curated FAZN-hosted events',
    Icon: FaznSpecialsSvg,
    accent: '#f59e0b',
  },
  {
    id: 'highlight',
    label: 'Share Highlight',
    description: 'Post a clip from your latest game',
    Icon: HighlightSvg,
    accent: '#22c55e',
  },
  {
    id: 'league',
    label: 'Start a League',
    description: 'Long-running seasonal competition',
    Icon: LeagueSvg,
    accent: '#ec4899',
  },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
}

export function CreateDrawer({ visible, onClose, onSelect }: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(DRAWER_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const open = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 180,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const close = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: DRAWER_HEIGHT,
        duration: 240,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (visible) open();
    else {
      translateY.setValue(DRAWER_HEIGHT);
      backdropOpacity.setValue(0);
    }
  }, [visible, open, translateY, backdropOpacity]);

  const handleSelect = (id: string) => {
    close();
    onSelect?.(id);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
      testID="create-drawer-modal"
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + spacing.md },
          { transform: [{ translateY }] },
        ]}
        testID="create-drawer"
      >
        {/* Handle */}
        <View style={styles.handleRow}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Create</Text>
          <TouchableOpacity
            onPress={close}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close"
            testID="create-drawer-close"
          >
            <CloseDrawerSvg size={20} />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <View style={styles.options}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.option}
              onPress={() => handleSelect(opt.id)}
              activeOpacity={0.75}
              accessibilityRole="button"
              testID={`create-option-${opt.id}`}
            >
              <View style={[styles.iconWrap, { backgroundColor: opt.accent + '22' }]}>
                <opt.Icon size={24} />
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>{opt.label}</Text>
                <Text style={styles.optionDesc}>{opt.description}</Text>
              </View>
              <View style={styles.chevron}>
                <Text style={styles.chevronText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: DRAWER_HEIGHT,
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  options: {
    paddingHorizontal: 20,
    gap: spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: { flex: 1 },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  chevron: { paddingLeft: spacing.xs },
  chevronText: {
    color: colors.textMuted,
    fontSize: 22,
    lineHeight: 26,
  },
});
