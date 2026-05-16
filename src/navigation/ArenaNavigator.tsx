import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ArenaStackParamList } from './types';
import { colors, spacing, radius } from '../theme';
import { ArenaScreen } from '../screens/app/arena/ArenaScreen';

const Stack = createNativeStackNavigator<ArenaStackParamList>();

function ChallengeDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<ArenaStackParamList, 'ChallengeDetail'>) {
  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right']}
      testID="challenge-detail-screen"
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        testID="challenge-detail-back-btn"
      >
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.illustration} />
        <Text style={styles.title}>Challenge</Text>
        <Text style={styles.hint}>ID: {route.params.challengeId}</Text>
        <Text style={styles.hint}>Detail screen coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

export function ArenaNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="ArenaMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ArenaMain" component={ArenaScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20 },
  backBtn: { marginTop: spacing.md, marginBottom: spacing.lg },
  backText: { color: colors.primaryLight, fontSize: 16, fontWeight: '600' },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  illustration: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  hint: { color: colors.textMuted, fontSize: 13, textAlign: 'center' },
});
