import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, radius } from '../../theme';
import { walletApi, ApiError } from '../../lib/api';
import { formatNaira } from '../../utils/wallet';

interface Props {
  visible: boolean;
  authorizationUrl: string;
  reference: string;
  amount: number;
  onSuccess: () => void;
  onClose: () => void;
}

type SheetState = 'opening' | 'verifying' | 'success' | 'failed';

function CloseIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function PaystackSheet({ visible, authorizationUrl, reference, amount, onSuccess, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [sheetState, setSheetState] = useState<SheetState>('opening');
  const [errorMessage, setErrorMessage] = useState('');
  const checkScale = useRef(new Animated.Value(0)).current;
  const didStart = useRef(false);

  useEffect(() => {
    if (!visible || didStart.current) return;
    didStart.current = true;

    (async () => {
      // Opens SFSafariViewController (iOS) / Chrome Custom Tab (Android).
      // Monitors for redirect back to the fazn:// scheme — when Paystack
      // redirects to our callback the browser auto-closes.
      const result = await WebBrowser.openAuthSessionAsync(
        authorizationUrl,
        'fazn://paystack',
        { showInRecents: false },
      );

      // result.type is 'success' (deep-link redirect caught) or 'cancel' (dismissed)
      // Either way, verify with the backend — the source of truth is Paystack, not
      // whether the redirect was intercepted.
      if (result.type === 'cancel') {
        // User closed the browser manually — close the sheet without verifying
        didStart.current = false;
        onClose();
        return;
      }

      setSheetState('verifying');

      try {
        await walletApi.verifyTopUp(reference);
        setSheetState('success');
        Animated.spring(checkScale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 5,
        }).start();
        setTimeout(() => {
          onSuccess();
        }, 1800);
      } catch (err) {
        const msg =
          err instanceof ApiError
            ? err.message
            : 'Payment verification failed. Contact support if charged.';
        setErrorMessage(msg);
        setSheetState('failed');
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    didStart.current = false;
    setSheetState('opening');
    setErrorMessage('');
    checkScale.setValue(0);
    void WebBrowser.dismissBrowser();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>{formatNaira(amount)}</Text>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            accessibilityRole="button"
            accessibilityLabel="Close"
            testID="paystack-sheet-close"
            hitSlop={12}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        {/* Opening — browser is launching */}
        {sheetState === 'opening' && (
          <View style={styles.body}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.bodyTitle}>Opening Paystack…</Text>
            <Text style={styles.bodySub}>
              Complete your payment in the browser that just opened
            </Text>
          </View>
        )}

        {/* Verifying */}
        {sheetState === 'verifying' && (
          <View style={styles.body}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.bodyTitle}>Confirming payment…</Text>
          </View>
        )}

        {/* Success */}
        {sheetState === 'success' && (
          <View style={styles.body}>
            <Animated.View
              style={[styles.iconCircle, styles.successCircle, { transform: [{ scale: checkScale }] }]}
            >
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path d="M5 13L9 17L19 7" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Animated.View>
            <Text style={styles.bodyTitle}>Payment Successful</Text>
            <Text style={styles.bodySub}>
              {formatNaira(amount)} has been added to your wallet
            </Text>
          </View>
        )}

        {/* Failed */}
        {sheetState === 'failed' && (
          <View style={styles.body}>
            <View style={[styles.iconCircle, styles.errorCircle]}>
              <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
                <Path d="M18 6L6 18M6 6L18 18" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
            </View>
            <Text style={styles.bodyTitle}>Payment Failed</Text>
            <Text style={styles.bodySub}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={handleClose}
              accessibilityRole="button"
              testID="paystack-sheet-retry"
            >
              <Text style={styles.retryText}>Close & Try Again</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: { width: 32 },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: spacing.md,
  },
  bodyTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bodySub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCircle: { backgroundColor: colors.success },
  errorCircle: { backgroundColor: colors.error },
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  retryText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
});
