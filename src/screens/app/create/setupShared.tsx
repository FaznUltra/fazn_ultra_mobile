import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
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
            <Text
              style={[
                styles.segmentText,
                active && styles.segmentTextActive,
              ]}
            >
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
        <Text
          style={[
            styles.dateRowValue,
            !value && styles.dateRowPlaceholder,
          ]}
        >
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

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = [0, 15, 30, 45];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

type CalStep = 'date' | 'time';

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
  const now = minimumDate;
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [step, setStep] = useState<CalStep>('date');
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmPm] = useState<'AM' | 'PM'>('PM');

  if (!visible) return null;

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDay = firstDayOfWeek(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const isDisabled = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(23, 59, 59, 999);
    return d < minimumDate;
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const onDayPress = (day: number) => {
    if (isDisabled(day)) return;
    setSelectedDay(day);
    setSelectedYear(viewYear);
    setSelectedMonth(viewMonth);
    setStep('time');
  };

  const onDone = () => {
    if (selectedDay === null) return;
    const h24 =
      ampm === 'AM'
        ? hour === 12 ? 0 : hour
        : hour === 12 ? 12 : hour + 12;
    const d = new Date(selectedYear, selectedMonth, selectedDay, h24, minute);
    onChange(d);
    setStep('date');
    onClose();
  };

  const onBack = () => setStep('date');

  return (
    <Modal transparent animationType="fade" visible={visible} testID={testID}>
      <View style={styles.calBackdrop}>
        <View style={styles.calCard}>
          {step === 'date' ? (
            <>
              <View style={styles.calHeader}>
                <TouchableOpacity
                  onPress={prevMonth}
                  accessibilityRole="button"
                  accessibilityLabel="Previous month"
                  testID="cal-prev"
                  hitSlop={12}
                >
                  <Text style={styles.calArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calMonthLabel}>
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </Text>
                <TouchableOpacity
                  onPress={nextMonth}
                  accessibilityRole="button"
                  accessibilityLabel="Next month"
                  testID="cal-next"
                  hitSlop={12}
                >
                  <Text style={styles.calArrow}>›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.weekRow}>
                {WEEKDAYS.map((d) => (
                  <Text key={d} style={styles.weekDay}>{d}</Text>
                ))}
              </View>

              <View style={styles.calGrid}>
                {cells.map((day, idx) => {
                  if (day === null) {
                    return <View key={`e-${idx}`} style={styles.calCell} />;
                  }
                  const disabled = isDisabled(day);
                  const active =
                    day === selectedDay &&
                    viewMonth === selectedMonth &&
                    viewYear === selectedYear;
                  return (
                    <TouchableOpacity
                      key={`d-${day}`}
                      style={[
                        styles.calCell,
                        styles.calDay,
                        active && styles.calDayActive,
                        disabled && styles.calDayDisabled,
                      ]}
                      onPress={() => onDayPress(day)}
                      disabled={disabled}
                      accessibilityRole="button"
                      accessibilityLabel={`${day}`}
                      testID={`cal-day-${day}`}
                    >
                      <Text
                        style={[
                          styles.calDayText,
                          active && styles.calDayTextActive,
                          disabled && styles.calDayTextDisabled,
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.calCancelBtn}
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                testID="cal-cancel"
              >
                <Text style={styles.calCancelText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.calHeader}>
                <TouchableOpacity
                  onPress={onBack}
                  accessibilityRole="button"
                  accessibilityLabel="Back to calendar"
                  testID="cal-back"
                  hitSlop={12}
                >
                  <Text style={styles.calArrow}>‹</Text>
                </TouchableOpacity>
                <Text style={styles.calMonthLabel}>
                  {selectedDay} {MONTH_NAMES[selectedMonth]} {selectedYear}
                </Text>
                <View style={{ width: 24 }} />
              </View>

              <Text style={styles.timeLabel}>Select time</Text>

              <Text style={styles.timeSectionLabel}>Hour</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.timeRow}
                testID="time-hours"
              >
                {HOURS.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.timeChip, hour === h && styles.timeChipActive]}
                    onPress={() => setHour(h)}
                    accessibilityRole="button"
                    accessibilityLabel={`${h}`}
                    testID={`hour-${h}`}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        hour === h && styles.timeChipTextActive,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.timeSectionLabel}>Minute</Text>
              <View style={styles.timeRow}>
                {MINUTES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.timeChip, minute === m && styles.timeChipActive]}
                    onPress={() => setMinute(m)}
                    accessibilityRole="button"
                    accessibilityLabel={`${m === 0 ? '00' : m}`}
                    testID={`minute-${m}`}
                  >
                    <Text
                      style={[
                        styles.timeChipText,
                        minute === m && styles.timeChipTextActive,
                      ]}
                    >
                      {m === 0 ? '00' : m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.ampmRow}>
                {(['AM', 'PM'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.ampmBtn, ampm === p && styles.ampmBtnActive]}
                    onPress={() => setAmPm(p)}
                    accessibilityRole="button"
                    accessibilityLabel={p}
                    testID={`ampm-${p}`}
                  >
                    <Text
                      style={[
                        styles.ampmText,
                        ampm === p && styles.ampmTextActive,
                      ]}
                    >
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.calDoneBtn}
                onPress={onDone}
                accessibilityRole="button"
                accessibilityLabel="Done"
                testID="cal-done"
              >
                <Text style={styles.calDoneText}>Confirm</Text>
              </TouchableOpacity>
            </>
          )}
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
  {
    type: 'public',
    title: 'Public',
    desc: 'Anyone can accept',
    Icon: GlobeSvg,
  },
  {
    type: 'private',
    title: 'Friends Only',
    desc: 'Only your friends see this',
    Icon: LockSvg,
  },
  {
    type: 'direct',
    title: 'Direct Challenge',
    desc: 'Challenge a specific friend',
    Icon: PersonAddSvg,
  },
];

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
  return (
    <View>
      {OPPONENT_OPTIONS.map(({ type, title, desc, Icon }) => {
        const active = value === type;
        return (
          <TouchableOpacity
            key={type}
            style={[styles.oppCard, active && styles.oppCardActive]}
            onPress={() => onChange(type)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={title}
            testID={`opponent-${type}`}
          >
            <Icon
              size={22}
              color={active ? colors.primaryLight : colors.textSecondary}
            />
            <View style={styles.oppMain}>
              <Text
                style={[
                  styles.oppTitle,
                  active && styles.oppTitleActive,
                ]}
              >
                {title}
              </Text>
              <Text style={styles.oppDesc}>{desc}</Text>
            </View>
            {active && <CheckSvg size={18} color={colors.primaryLight} />}
          </TouchableOpacity>
        );
      })}

      {value === 'direct' && (
        <View style={styles.friendsWrap} testID="friends-list">
          <FlatList
            data={MOCK_FRIENDS}
            scrollEnabled={false}
            keyExtractor={(f) => f.id}
            ItemSeparatorComponent={() => (
              <View style={styles.friendSeparator} />
            )}
            renderItem={({ item }) => {
              const picked = selectedFriend?.id === item.id;
              return (
                <View style={styles.friendRow} testID={`friend-${item.id}`}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.friendName}>{item.name}</Text>
                  {picked ? (
                    <View
                      style={styles.friendPicked}
                      testID={`friend-picked-${item.id}`}
                    >
                      <CheckSvg size={16} color={colors.success} />
                      <Text style={styles.friendPickedText}>Selected</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.friendSelectBtn}
                      onPress={() => onSelectFriend(item)}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${item.name}`}
                      testID={`friend-select-${item.id}`}
                    >
                      <Text style={styles.friendSelectText}>Select</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

export function useDateState() {
  const [acceptanceDue, setAcceptanceDue] = useState<Date | null>(null);
  const [gameStartTime, setGameStartTime] = useState<Date | null>(null);
  return {
    acceptanceDue,
    setAcceptanceDue,
    gameStartTime,
    setGameStartTime,
  };
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
  segmented: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
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
  segmentActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
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
  stakeSymbol: {
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  stakeInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    padding: 0,
  },
  stakeError: {
    color: colors.error,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  stakeBreakdown: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
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
  dateRowValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  dateRowPlaceholder: { color: colors.textMuted, fontWeight: '400' },
  calBackdrop: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'flex-end',
  },
  calCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  calArrow: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 30,
    fontWeight: '300',
  },
  calMonthLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDay: {},
  calDayActive: {
    backgroundColor: colors.primary,
    borderRadius: 999,
  },
  calDayDisabled: {},
  calDayText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  calDayTextActive: { color: '#fff', fontWeight: '700' },
  calDayTextDisabled: { color: colors.border },
  calCancelBtn: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  calCancelText: { color: colors.textMuted, fontSize: 14 },
  calDoneBtn: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calDoneText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  timeLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.md,
  },
  timeSectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeChip: {
    minWidth: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  timeChipActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
  timeChipText: { color: colors.textSecondary, fontSize: 15, fontWeight: '600' },
  timeChipTextActive: { color: colors.primaryLight },
  ampmRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  ampmBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmBtnActive: {
    backgroundColor: colors.primary + '22',
    borderColor: colors.primary,
  },
  ampmText: { color: colors.textSecondary, fontSize: 15, fontWeight: '700' },
  ampmTextActive: { color: colors.primaryLight },
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
  oppCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '14',
  },
  oppMain: { flex: 1 },
  oppTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '600' },
  oppTitleActive: { color: colors.primaryLight },
  oppDesc: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  friendsWrap: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  friendSeparator: { height: 1, backgroundColor: colors.border },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.primaryLight, fontSize: 15, fontWeight: '700' },
  friendName: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  friendSelectBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  friendSelectText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  friendPicked: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  friendPickedText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
});
