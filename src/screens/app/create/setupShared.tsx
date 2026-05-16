import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { colors, spacing, radius } from '../../../theme';
import { formatNaira } from '../../../utils/wallet';
import type { OpponentType } from '../../../types/challenge';
import {
  GlobeSvg,
  LockSvg,
  PersonAddSvg,
  CheckSvg,
  CalendarSvg,
} from './ChallengeIcons';

export const FEE_RATE = 0.05;
export const MIN_STAKE = 500;

export interface MockFriend {
  id: string;
  name: string;
}

export const MOCK_FRIENDS: MockFriend[] = [
  { id: 'f1', name: 'Daniel Okafor' },
  { id: 'f2', name: 'Amara Bello' },
  { id: 'f3', name: 'Tunde Adewale' },
  { id: 'f4', name: 'Ngozi Eze' },
  { id: 'f5', name: 'Samuel Ojo' },
];

export function ReadonlyChip({
  label,
  value,
  tone = 'muted',
  testID,
}: {
  label: string;
  value: string;
  tone?: 'muted' | 'success' | 'error';
  testID?: string;
}) {
  const valueColor =
    tone === 'success'
      ? colors.success
      : tone === 'error'
        ? colors.error
        : colors.textPrimary;
  return (
    <View style={styles.chip} testID={testID}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={[styles.chipValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  formatOption,
  testIDPrefix,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  formatOption?: (v: T) => string;
  testIDPrefix: string;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <TouchableOpacity
            key={String(opt)}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(opt)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={String(opt)}
            testID={`${testIDPrefix}-${opt}`}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
              {formatOption ? formatOption(opt) : String(opt)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function StakeInput({
  stake,
  onChange,
}: {
  stake: string;
  onChange: (v: string) => void;
}) {
  const amount = Number(stake) || 0;
  const fee = Math.round(amount * 2 * FEE_RATE);
  const potential = Math.round(amount * 2 * (1 - FEE_RATE));
  const tooLow = amount > 0 && amount < MIN_STAKE;
  return (
    <View>
      <View style={styles.stakeInputWrap}>
        <Text style={styles.stakeSymbol}>₦</Text>
        <TextInput
          style={styles.stakeInput}
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
          value={stake}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
          accessibilityLabel="Stake amount"
          testID="stake-input"
        />
      </View>
      {tooLow && (
        <Text style={styles.stakeError} testID="stake-error">
          Minimum stake is {formatNaira(MIN_STAKE)}
        </Text>
      )}
      <View style={styles.stakeBreakdown}>
        <Text style={styles.stakeBreakdownText}>
          Platform fee (5%): {formatNaira(fee)}
        </Text>
        <Text style={styles.stakeWinText} testID="potential-win">
          Potential win: {formatNaira(potential)}
        </Text>
      </View>
    </View>
  );
}

export function DateRow({
  label,
  value,
  onPress,
  testID,
}: {
  label: string;
  value: Date | null;
  onPress: () => void;
  testID: string;
}) {
  return (
    <TouchableOpacity
      style={styles.dateRow}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
    >
      <CalendarSvg size={18} color={colors.textMuted} />
      <View style={styles.dateRowMain}>
        <Text style={styles.dateRowLabel}>{label}</Text>
        <Text style={[styles.dateRowValue, !value && styles.dateRowPlaceholder]}>
          {value ? formatDateTime(value) : 'Tap to select'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function formatDateTime(d: Date): string {
  return d.toLocaleString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function PlatformDatePicker({
  visible,
  value,
  minimumDate,
  onChange,
  onClose,
  testID,
}: {
  visible: boolean;
  value: Date;
  minimumDate: Date;
  onChange: (d: Date) => void;
  onClose: () => void;
  testID: string;
}) {
  const [tempDate, setTempDate] = useState<Date>(value);

  const handleChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (!selected) return;
    if (Platform.OS === 'android') {
      onChange(selected);
      onClose();
    } else {
      setTempDate(selected);
    }
  };

  if (Platform.OS === 'android') {
    if (!visible) return null;
    return (
      <DateTimePicker
        value={value}
        mode="datetime"
        minimumDate={minimumDate}
        display="default"
        onChange={handleChange}
        testID={testID}
      />
    );
  }

  return (
    <Modal transparent animationType="slide" visible={visible} testID={testID}>
      <View style={styles.iosBackdrop}>
        <TouchableOpacity
          style={styles.iosDismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />
        <View style={styles.iosSheet}>
          <View style={styles.iosSheetHandle} />
          <View style={styles.iosSheetHeader}>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              testID={`${testID}-cancel`}
            >
              <Text style={styles.iosCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { onChange(tempDate); onClose(); }}
              accessibilityRole="button"
              accessibilityLabel="Done"
              testID={`${testID}-done`}
            >
              <Text style={styles.iosDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="datetime"
            minimumDate={minimumDate}
            display="spinner"
            onChange={handleChange}
            themeVariant="dark"
            testID={`${testID}-picker`}
          />
        </View>
      </View>
    </Modal>
  );
}

const OPPONENT_OPTIONS: {
  type: OpponentType;
  title: string;
  desc: string;
  Icon: React.FC<{ size?: number; color?: string }>;
}[] = [
  { type: 'public', title: 'Public', desc: 'Anyone can accept', Icon: GlobeSvg },
  { type: 'private', title: 'Friends Only', desc: 'Only your friends see this', Icon: LockSvg },
  { type: 'direct', title: 'Direct Challenge', desc: 'Challenge a specific friend', Icon: PersonAddSvg },
];

export function FriendsDrawer({
  visible,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  selected: MockFriend | null;
  onSelect: (f: MockFriend) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = MOCK_FRIENDS.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      testID="friends-drawer"
    >
      <View style={styles.drawerBackdrop}>
        <TouchableOpacity
          style={styles.drawerDismiss}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={styles.drawerSheet}>
          <View style={styles.drawerHandle} />
          <View style={styles.drawerHeader}>
            <Text style={styles.drawerTitle}>Choose opponent</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              testID="friends-drawer-close"
            >
              <Text style={styles.drawerClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.drawerSearch}>
            <TextInput
              style={styles.drawerSearchInput}
              placeholder="Search friends..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
              accessibilityLabel="Search friends"
              testID="friends-search"
            />
          </View>

          <ScrollView
            style={styles.drawerList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            testID="friends-scroll"
          >
            {filtered.length === 0 ? (
              <Text style={styles.drawerEmpty}>No friends found</Text>
            ) : (
              filtered.map((item, idx) => {
                const picked = selected?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.drawerRow,
                      idx < filtered.length - 1 && styles.drawerRowBorder,
                      picked && styles.drawerRowActive,
                    ]}
                    onPress={() => { onSelect(item); onClose(); }}
                    accessibilityRole="button"
                    accessibilityLabel={`Challenge ${item.name}`}
                    testID={`friend-select-${item.id}`}
                  >
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <Text style={styles.drawerFriendName}>{item.name}</Text>
                    {picked && <CheckSvg size={18} color={colors.success} />}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export function OpponentPicker({
  value,
  onChange,
  selectedFriend,
  onSelectFriend,
}: {
  value: OpponentType | null;
  onChange: (t: OpponentType) => void;
  selectedFriend: MockFriend | null;
  onSelectFriend: (f: MockFriend) => void;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View>
      {OPPONENT_OPTIONS.map(({ type, title, desc, Icon }) => {
        const active = value === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.oppCard, active && styles.oppCardActive]}
            onPress={() => {
              onChange(type);
              if (type === 'direct') setDrawerOpen(true);
            }}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={title}
            testID={`opponent-${type}`}
          >
            <Icon size={22} color={active ? colors.primaryLight : colors.textSecondary} />
            <View style={styles.oppMain}>
              <Text style={[styles.oppTitle, active && styles.oppTitleActive]}>{title}</Text>
              <Text style={styles.oppDesc}>{desc}</Text>
            </View>
            {active && <CheckSvg size={18} color={colors.primaryLight} />}
          </TouchableOpacity>
        );
      })}

      {value === 'direct' && selectedFriend && (
        <TouchableOpacity
          style={styles.selectedFriendRow}
          onPress={() => setDrawerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Change opponent"
          testID="selected-friend-row"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{selectedFriend.name.charAt(0)}</Text>
          </View>
          <Text style={styles.selectedFriendName}>{selectedFriend.name}</Text>
          <Text style={styles.selectedFriendChange}>Change</Text>
        </TouchableOpacity>
      )}

      {value === 'direct' && !selectedFriend && (
        <TouchableOpacity
          style={styles.chooseFriendBtn}
          onPress={() => setDrawerOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Choose friend"
          testID="choose-friend-btn"
        >
          <Text style={styles.chooseFriendText}>Choose a friend</Text>
        </TouchableOpacity>
      )}

      <FriendsDrawer
        visible={drawerOpen}
        selected={selectedFriend}
        onSelect={onSelectFriend}
        onClose={() => setDrawerOpen(false)}
      />
    </View>
  );
}

export function useDateState() {
  const [acceptanceDue, setAcceptanceDue] = useState<Date | null>(null);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  return { acceptanceDue, setAcceptanceDue, gameStartTime, setGameStartTime };
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  chipLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  chipValue: { fontSize: 14, fontWeight: '700' },
  segmented: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  segment: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  segmentActive: { backgroundColor: colors.primary + '22', borderColor: colors.primary },
  segmentText: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  segmentTextActive: { color: colors.primaryLight },
  stakeInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    minHeight: 52,
  },
  stakeSymbol: { color: colors.textSecondary, fontSize: 18, fontWeight: '700', marginRight: spacing.sm },
  stakeInput: { flex: 1, color: colors.textPrimary, fontSize: 18, fontWeight: '700', padding: 0 },
  stakeError: { color: colors.error, fontSize: 12, marginTop: spacing.xs },
  stakeBreakdown: { marginTop: spacing.sm, gap: spacing.xs },
  stakeBreakdownText: { color: colors.textMuted, fontSize: 13 },
  stakeWinText: { color: colors.success, fontSize: 13, fontWeight: '700' },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.xs,
  },
  dateRowMain: { flex: 1 },
  dateRowLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  dateRowValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginTop: 2 },
  dateRowPlaceholder: { color: colors.textMuted, fontWeight: '400' },
  iosBackdrop: { flex: 1, justifyContent: 'flex-end' },
  iosDismiss: { flex: 1, backgroundColor: '#000000aa' },
  iosSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
  },
  iosSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  iosSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  iosCancelText: { color: colors.textMuted, fontSize: 16 },
  iosDoneText: { color: colors.primaryLight, fontSize: 16, fontWeight: '700' },
  drawerBackdrop: { flex: 1, justifyContent: 'flex-end' },
  drawerDismiss: { flex: 1, backgroundColor: '#000000aa' },
  drawerSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '75%',
  },
  drawerHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  drawerClose: { color: colors.textMuted, fontSize: 18 },
  drawerSearch: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  drawerSearchInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    fontSize: 15,
  },
  drawerList: { flexGrow: 0 },
  drawerEmpty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
  },
  drawerRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  drawerRowActive: { backgroundColor: colors.primary + '14' },
  drawerFriendName: { flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primaryLight, fontSize: 16, fontWeight: '700' },
  oppCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  oppCardActive: { borderColor: colors.primary, backgroundColor: colors.primary + '14' },
  oppMain: { flex: 1 },
  oppTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  oppTitleActive: { color: colors.primaryLight },
  oppDesc: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  selectedFriendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.primary + '66',
  },
  selectedFriendName: { flex: 1, color: colors.textPrimary, fontSize: 15, fontWeight: '500' },
  selectedFriendChange: { color: colors.primaryLight, fontSize: 13, fontWeight: '600' },
  chooseFriendBtn: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
  },
  chooseFriendText: { color: colors.primaryLight, fontSize: 14, fontWeight: '600' },
});
