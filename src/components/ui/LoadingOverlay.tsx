import React from 'react';
import { View, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { colors } from '../../theme';

interface LoadingOverlayProps {
  visible: boolean;
}

/** Full-screen semi-transparent dark overlay with a purple spinner. */
export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay} accessibilityLabel="Loading">
        <ActivityIndicator size="large" color={colors.primaryLight} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
