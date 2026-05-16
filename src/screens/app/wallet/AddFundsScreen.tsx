import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../navigation/types';
import { colors, spacing, radius } from '../../../theme';
import { Button } from '../../../components/ui/Button';
import { TopUpCard } from '../../../components/wallet/TopUpCard';
import {
  ChevronLeftIcon,
  CheckIcon,
  WalletGlyph,
} from '../../../components/wallet/WalletIcons';
import { useWallet } from '../../../hooks/useWallet';
import { PaystackSheet } from '../../../components/wallet/PaystackSheet';
import { formatNaira, TOP_UP_PRESETS } from '../../../utils/wallet';
import type { PaymentMethod } from '../../../types/wallet';

type Props = NativeStackScreenProps<HomeStackParamList, 'AddFunds'>;
type Step = 'amount' | 'method' | 'processing';

const METHODS: { id: PaymentMethod; name: string; sub: string }[] = [
  { id: 'paystack_card', name: 'Paystack Card', sub: 'Instant · Debit/Credit cards' },
  {
    id: 'paystack_bank',
    name: 'Paystack Bank Transfer',
    sub: 'Transfer from your bank',
  },
  { id: 'paystack_ussd', name: 'USSD', sub: 'Dial a code · No internet needed' },
  { id: 'bank_transfer', name: 'Direct Bank Transfer', sub: 'Manual · 1-3 hours' },
];

export function AddFundsScreen({ navigation, route }: Props) {
  const { topUp, refreshWallet } = useWallet();

  const presets = TOP_UP_PRESETS;
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState<number | null>(
    route.params?.preselectedAmount ?? null,
  );
  const [custom, setCustom] = useState('');
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [done, setDone] = useState(false);
  const [paystackUrl, setPaystackUrl] = useState<string | null>(null);
  const [paystackRef, setPaystackRef] = useState('');
  const checkScale = useRef(new Animated.Value(0)).current;

  const methods = METHODS;

  const effectiveAmount =
    custom.trim().length > 0 ? Number(custom) || 0 : amount ?? 0;

  useEffect(() => {
    if (step !== 'processing') return;
    if (!method) return;

    let cancelled = false;
    setDone(false);

    (async () => {
      try {
        const resp = await topUp(effectiveAmount, method);
        if (cancelled) return;

        if (resp.authorizationUrl) {
          // Open Paystack inside the in-app sheet (no browser handoff)
          setPaystackRef(resp.reference);
          setPaystackUrl(resp.authorizationUrl);
        } else {
          // Mock mode (Paystack key not configured) — show success immediately
          setDone(true);
          Animated.spring(checkScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 5,
          }).start();
        }
      } catch (err) {
        if (cancelled) return;
        const message =
          err instanceof Error ? err.message : 'Payment could not be started.';
        Alert.alert('Payment failed', message, [
          { text: 'OK', onPress: () => setStep('method') },
        ]);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onSelectPreset = (value: number) => {
    setAmount(value);
    setCustom('');
  };

  // ---------- Paystack in-app sheet ----------
  if (paystackUrl) {
    return (
      <PaystackSheet
        visible
        authorizationUrl={paystackUrl}
        reference={paystackRef}
        amount={effectiveAmount}
        onSuccess={() => {
          setPaystackUrl(null);
          void refreshWallet();
          navigation.goBack();
        }}
        onClose={() => {
          setPaystackUrl(null);
          setStep('method');
        }}
      />
    );
  }

  // ---------- Step 3: processing / success ----------
  if (step === 'processing') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        {!done ? (
          <View style={styles.center} testID="payment-processing">
            <ActivityIndicator size="large" color={colors.primaryLight} />
            <Text style={styles.processingTitle}>
              Processing your payment…
            </Text>
            <Text style={styles.muted}>Do not close this screen</Text>
          </View>
        ) : (
          <View style={styles.center} testID="payment-success">
            <Animated.View
              style={[styles.checkCircle, { transform: [{ scale: checkScale }] }]}
            >
              <CheckIcon size={48} color="#fff" />
            </Animated.View>
            <Text style={styles.successTitle}>Top-up Queued</Text>
            <Text style={styles.muted}>
              {formatNaira(effectiveAmount)} will be credited once payment is confirmed
            </Text>
            <View style={styles.doneBtnWrap}>
              <Button
                title="Done"
                onPress={() => navigation.goBack()}
                testID="payment-done-btn"
              />
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="add-funds-screen"
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() =>
            step === 'method' ? setStep('amount') : navigation.goBack()
          }
          accessibilityRole="button"
          accessibilityLabel="Go back"
          testID="add-funds-back-btn"
        >
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {step === 'amount' ? 'Add Money' : 'Payment Method'}
        </Text>
        <View style={styles.backSpacer} />
      </View>

      {step === 'amount' && (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.grid}>
            {presets.map((opt) => (
              <TopUpCard
                key={opt.amount}
                option={opt}
                selected={!custom && amount === opt.amount}
                onPress={() => onSelectPreset(opt.amount)}
                style={styles.gridCard}
              />
            ))}
          </View>

          <Text style={styles.label}>Enter amount in Naira</Text>
          <View style={styles.inputRow}>
            <Text style={styles.nairaPrefix}>₦</Text>
            <TextInput
              style={styles.inputField}
              value={custom}
              onChangeText={(t) => {
                setCustom(t.replace(/[^0-9]/g, ''));
                setAmount(null);
              }}
              placeholder="e.g. 3000"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              testID="custom-amount-input"
            />
          </View>
          {effectiveAmount > 0 && (
            <Text style={styles.equiv} testID="custom-amount-equiv">
              You pay {formatNaira(effectiveAmount)}
            </Text>
          )}

          <View style={styles.cta}>
            <Button
              title="Continue"
              onPress={() => setStep('method')}
              disabled={effectiveAmount <= 0}
              testID="add-funds-continue-btn"
            />
          </View>
        </ScrollView>
      )}

      {step === 'method' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.payHeader}>
            Pay {formatNaira(effectiveAmount)}
          </Text>

          <View style={styles.methodList} testID="payment-method-list">
            {methods.map((m) => {
              const active = method === m.id;
              return (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.methodRow, active && styles.methodRowActive]}
                  onPress={() => setMethod(m.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  testID={`payment-method-${m.id}`}
                >
                  <View style={styles.methodLogo}>
                    <WalletGlyph size={20} color={colors.primaryLight} />
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{m.name}</Text>
                    <Text style={styles.methodSub}>{m.sub}</Text>
                  </View>
                  <View
                    style={[styles.radio, active && styles.radioActive]}
                  >
                    {active && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.cta}>
            <Button
              title="Pay Now"
              onPress={() => setStep('processing')}
              disabled={!method}
              testID="pay-now-btn"
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
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
  backSpacer: { width: 24 },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  content: { paddingHorizontal: 20, paddingBottom: spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  gridCard: { width: '48%' },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
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
  equiv: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  cta: { marginTop: spacing.xl },
  payHeader: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  methodList: { gap: spacing.sm },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  methodRowActive: { borderColor: colors.primary },
  methodLogo: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  methodInfo: { flex: 1 },
  methodName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  methodSub: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  processingTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  muted: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
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
  doneBtnWrap: { marginTop: spacing.xl, alignSelf: 'stretch' },
});
