import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from './types';
import { colors } from '../theme';
import { ProfileScreen } from '../screens/app/ProfileScreen';
import { EditProfileScreen } from '../screens/app/profile/EditProfileScreen';
import { PrivacyScreen } from '../screens/app/profile/PrivacyScreen';
import { SettingsScreen } from '../screens/app/profile/SettingsScreen';
import { StreamingChannelsScreen } from '../screens/app/profile/StreamingChannelsScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="ProfileMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen
        name="StreamingChannels"
        component={StreamingChannelsScreen}
      />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
