import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { colors } from '../../theme';

export function HomeScreen() {
  return (
    <ScreenContainer testID="home-screen">
      <Text style={styles.title}>Home</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.textPrimary, fontSize: 28, fontWeight: '700' },
});
