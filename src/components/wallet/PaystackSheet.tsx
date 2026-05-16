import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, radius } from '../../theme';
import { walletApi, ApiError } from '../../lib/api';
import { formatNaira } from '../../utils/wallet';

// Paystack redirects to this URL on success/failure — we intercept it
// in the WebView before it actually loads so we never leave the sheet.
const CALLBACK_SENTINEL = 'fazn://paystack/callback';

interface Props {
  visible: boolean;
  authorizationUrl: string;
  reference: string;
  amount: number;
  onSuccess: () => void;  // caller should refresh wallet
  onClose: () => void;
}

type SheetState = 'loading' | 'webview' | 'verifying' | 'success' | 'failed';

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

function CheckLarge() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5 13L9 17L19 7"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ErrorIcon() {
  return (
    <Svg width={48} height={48} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 8V12M12 16H12.01"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <Path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 12 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#fff"
        strokeWidth={2}
      />
    </Svg>
  );
}

export function PaystackSheet({ visible, authorizationUrl, reference, amount, onSuccess, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [sheetState, setSheetState] = useState<SheetState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const checkScale = useRef(new Animated.Value(0)).current;

  const handleNavigationStateChange = async (navState: WebViewNavigation) => {
    const url = navState.url ?? '';

    // Paystack redirects to the callback URL on completion.
    // We intercept any URL that starts with our sentinel or the backend callback.
    const isCallback =
      url.startsWith(CALLBACK_SENTINEL) ||
      url.includes('/wallet/topup/verify') ||
      url.includes('paystack.com/close') ||
      // Paystack sends trxref + reference on success redirect
      (url.includes('trxref=') && url.includes('reference='));

    if (!isCallback) return;

    setSheetState('verifying');

    try {
      await walletApi.verifyTopUp(reference);
      setSheetState('success');
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
      // Notify parent to refresh balance after short delay so user sees success screen
      setTimeout(() => {
        onSuccess();
      }, 1800);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Payment verification failed. Contact support if charged.';
      setErrorMessage(msg);
      setSheetState('failed');
    }
  };

  const handleClose = () => {
    setSheetState('loading');
    setErrorMessage('');
    checkScale.setValue(0);
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
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.headerLeft} />
          <Text style={styles.headerTitle}>
            {sheetState === 'verifying' ? 'Verifying…' : `Pay ${formatNaira(amount)}`}
          </Text>
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

        {/* Verifying overlay */}
        {sheetState === 'verifying' && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.overlayText}>Confirming your payment…</Text>
          </View>
        )}

        {/* Success */}
        {sheetState === 'success' && (
          <View style={styles.overlay}>
            <Animated.View style={[styles.iconCircle, styles.successCircle, { transform: [{ scale: checkScale }] }]}>
              <CheckLarge />
            </Animated.View>
            <Text style={styles.resultTitle}>Payment Successful</Text>
            <Text style={styles.resultSub}>
              {formatNaira(amount)} has been added to your wallet
            </Text>
          </View>
        )}

        {/* Failed */}
        {sheetState === 'failed' && (
          <View style={styles.overlay}>
            <View style={[styles.iconCircle, styles.errorCircle]}>
              <ErrorIcon />
            </View>
            <Text style={styles.resultTitle}>Payment Failed</Text>
            <Text style={styles.resultSub}>{errorMessage}</Text>
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

        {/* WebView — stays mounted so Paystack JS doesn't reload on state changes */}
        <View style={[styles.webviewWrap, (sheetState === 'verifying' || sheetState === 'success' || sheetState === 'failed') && styles.hidden]}>
          <WebView
            source={{ uri: authorizationUrl }}
            onNavigationStateChange={handleNavigationStateChange}
            onShouldStartLoadWithRequest={(req) => {
              // Block the actual navigation to the callback URL — we handle it ourselves
              const url = req.url ?? '';
              if (
                url.startsWith(CALLBACK_SENTINEL) ||
                url.includes('/wallet/topup/verify') ||
                (url.includes('trxref=') && url.includes('reference='))
              ) {
                void handleNavigationStateChange({ url } as WebViewNavigation);
                return false;
              }
              return true;
            }}
            onLoadStart={() => setSheetState('loading')}
            onLoad={() => setSheetState('webview')}
            onError={() => {
              setErrorMessage('Could not load the payment page. Check your connection.');
              setSheetState('failed');
            }}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoader}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.overlayText}>Loading payment page…</Text>
              </View>
            )}
            javaScriptEnabled
            domStorageEnabled
            testID="paystack-webview"
          />
        </View>
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
  webviewWrap: { flex: 1 },
  hidden: { position: 'absolute', width: 0, height: 0, opacity: 0 },
  webviewLoader: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: spacing.md,
  },
  overlayText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  successCircle: { backgroundColor: colors.success },
  errorCircle: { backgroundColor: colors.error },
  resultTitle: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  resultSub: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
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
