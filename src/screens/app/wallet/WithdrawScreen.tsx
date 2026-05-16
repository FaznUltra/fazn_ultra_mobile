import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { colors, spacing, radius } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { ChevronLeftIcon, CheckIcon } from '../../../components/wallet/WalletIcons';
import { useWallet } from '../../../hooks/useWallet';
import {
  formatNaira,
  MIN_WITHDRAWAL,
  WITHDRAWAL_FEE,
} from '../../../utils/wallet';
import type { BankDetails } from '../../../types/wallet';

type Props = NativeStackScreenProps<HomeStackParamList, 'Withdraw'>;
type Step = 'amount' | 'bank' | 'confirm';

export function WithdrawScreen({ navigation }: Props) {
  const { state, withdraw } = useWallet();
  const balance = state.status === 'success' ? state.data.balance : 0;

  const [step, setStep] = useState<Step>('amount');
  const [amountStr, setAmountStr] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const checkScale = useRef(new Animated.Value(0)).current;

  const amount = Number(amountStr) || 0;
  const belowMin = amount > 0 && amount < MIN_WITHDRAWAL;
  const overBalance = amount > balance;
  const canContinue =
    amount >= MIN_WITHDRAWAL && !overBalance && amount > 0;

  const setPct = (pct: number) =>
    setAmountStr(String(Math.floor(balance * pct)));

  const bankComplete =
    accountName.trim() && accountNumber.trim() && bankName.trim();

  const doWithdraw = () => {
    const details: BankDetails = {
      accountName,
      accountNumber,
      bankName,
    };
    void withdraw(amount, 'bank_transfer', details);
    setSubmitted(true);
    Animated.spring(checkScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 5,
    }).start();
  };

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.center} testID="withdrawal-success">
          <Animated.View
            style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}
          >
            <CheckIcon size={48} color="#fff" />
          </Animated.View>
          <Text style={styles.successTitle}>Withdrawal Submitted</Text>
          <Text style={styles.muted}>
            {formatNaira(amount - WITHDRAWAL_FEE)} will be sent to your bank
          </Text>
          <View style={styles.doneWrap}>
            <Button title="Done" onPress={() => navigation.goBack()} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="withdraw-screen"
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => {
            if (step === 'amount') navigation.goBack();
            else if (step === 'bank') setStep('amount');
            else setStep('bank');
          }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="withdraw-back-btn"
        >
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Withdraw</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {step === 'amount' && (
          <>
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                Available: {formatNaira(balance)}
              </Text>
            </View>

            <View style={styles.inputRow}>
              <Text style={styles.nairaPrefix}>₦</Text>
              <TextInput
                style={styles.inputField}
                value={amountStr}
                onChangeText={(t) => setAmountStr(t.replace(/[^0-9]/g, ''))}
                placeholder="Amount in Naira"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                testID="withdraw-amount-input"
              />
            </View>

            <View style={styles.quickRow}>
              {[
                { l: '25%', v: 0.25, k: '25' },
                { l: '50%', v: 0.5, k: '50' },
                { l: '75%', v: 0.75, k: '75' },
                { l: 'Max', v: 1, k: 'max' },
              ].map((q) => (
                <TouchableOpacity
                  key={q.k}
                  style={styles.quickBtn}
                  onPress={() => setPct(q.v)}
                  accessibilityRole="button"
                  testID={`withdraw-quick-${q.k}`}
                >
                  <Text style={styles.quickText}>{q.l}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {belowMin && (
              <Text style={styles.warn} testID="withdraw-min-warning">
                Minimum withdrawal is {formatNaira(MIN_WITHDRAWAL)}
              </Text>
            )}
            {overBalance && (
              <Text style={styles.warn}>Amount exceeds your balance</Text>
            )}

            <View style={styles.cta}>
              <Button
                title="Continue"
                onPress={() => setStep('bank')}
                disabled={!canContinue}
                testID="withdraw-continue-btn"
              />
            </View>
          </>
        )}

        {step === 'bank' && (
          <>
            <View style={styles.methodToggle}>
              <Text style={styles.methodToggleText}>Bank Transfer</Text>
            </View>

            <Text style={styles.fieldLabel}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={accountName}
              onChangeText={setAccountName}
              placeholder="John Doe"
              placeholderTextColor={colors.textMuted}
              testID="bank-account-name"
            />

            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={accountNumber}
              onChangeText={(t) => setAccountNumber(t.replace(/[^0-9]/g, ''))}
              placeholder="0123456789"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              testID="bank-account-number"
            />

            <Text style={styles.fieldLabel}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bankName}
              onChangeText={setBankName}
              placeholder="GTBank"
              placeholderTextColor={colors.textMuted}
              testID="bank-name"
            />

            <View style={styles.cta}>
              <Button
                title="Submit Withdrawal"
                onPress={() => setStep('confirm')}
                disabled={!bankComplete}
                testID="submit-withdrawal-btn"
              />
            </View>
          </>
        )}

        {step === 'confirm' && (
          <>
            <View style={styles.summary}>
              <Row label="Amount" value={formatNaira(amount)} />
              <Row
                label="Processing fee"
                value={`− ${formatNaira(WITHDRAWAL_FEE)}`}
              />
              <Row
                label="You receive"
                value={formatNaira(amount - WITHDRAWAL_FEE)}
              />
              <Row label="Bank" value={`${bankName} · ${accountNumber}`} />
              <Row label="Estimated arrival" value="1–3 business days" />
            </View>

            <View style={styles.feeWarn}>
              <Text style={styles.feeWarnText}>
                {formatNaira(WITHDRAWAL_FEE)} processing fee deducted from your
                withdrawal
              </Text>
            </View>

            <View style={styles.cta}>
              <Button
                title="Confirm Withdrawal"
                onPress={doWithdraw}
                testID="confirm-withdrawal-btn"
              />
              <View style={{ height: spacing.sm }} />
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => navigation.goBack()}
                testID="cancel-withdrawal-btn"
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing.md,
  },
  spacer: { width: 24 },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: spacing.xl },
  chip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  nairaPrefix: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  inputField: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  quickText: { color: colors.textPrimary, fontSize: 13, fontWeight: '700' },
  warn: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  cta: { marginTop: spacing.xl },
  methodToggle: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  methodToggleText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: { color: colors.textMuted, fontSize: 14 },
  summaryValue: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  feeWarn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: radius.sm,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  feeWarnText: { color: '#f59e0b', fontSize: 13, fontWeight: '600' },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  doneWrap: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
