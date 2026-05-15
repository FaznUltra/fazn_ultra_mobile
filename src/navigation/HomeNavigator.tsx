import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from './types';
import { colors, spacing, radius } from '../theme';
import { HomeScreen } from '../screens/app/home/HomeScreen';
import { GlobalSearchScreen } from '../screens/app/home/GlobalSearchScreen';
import { NotificationsScreen } from '../screens/app/home/NotificationsScreen';
import { UserPublicProfileScreen } from '../screens/app/home/UserPublicProfileScreen';
import { ScreenContainer } from '../components/ui/ScreenContainer';

const Stack = createNativeStackNavigator<HomeStackParamList>();

function Placeholder({
  label,
  value,
  testID,
  onBack,
}: {
  label: string;
  value: string;
  testID: string;
  onBack: () => void;
}) {
  return (
    <ScreenContainer testID={testID} noScroll>
      <TouchableOpacity
        onPress={onBack}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        testID={`${testID}-back-btn`}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>
      <View style={styles.body}>
        <View style={styles.illustration} />
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.hint}>{value}</Text>
        <Text style={styles.hint}>Detail screen coming soon.</Text>
      </View>
    </ScreenContainer>
  );
}

function ChallengeDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, 'ChallengeDetail'>) {
  return (
    <Placeholder
      label="Challenge"
      value={`ID: ${route.params.challengeId}`}
      testID="challenge-detail-screen"
      onBack={() => navigation.goBack()}
    />
  );
}

function StreamDetailScreen({
  navigation,
  route,
}: NativeStackScreenProps<HomeStackParamList, 'StreamDetail'>) {
  return (
    <Placeholder
      label="Live Stream"
      value={`ID: ${route.params.streamId}`}
      testID="stream-detail-screen"
      onBack={() => navigation.goBack()}
    />
  );
}

export function HomeNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="HomeMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="GlobalSearch" component={GlobalSearchScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen
        name="UserPublicProfile"
        component={UserPublicProfileScreen}
      />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="StreamDetail" component={StreamDetailScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  backBtn: { marginBottom: spacing.lg },
  backText: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: '600',
  },
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
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
  },
});
