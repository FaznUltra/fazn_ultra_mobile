import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { FriendsStackParamList } from './types';
import { colors } from '../theme';
import { FriendsScreen } from '../screens/app/friends/FriendsScreen';
import { FriendSearchScreen } from '../screens/app/friends/FriendSearchScreen';
import { FriendRequestsScreen } from '../screens/app/friends/FriendRequestsScreen';

const Stack = createNativeStackNavigator<FriendsStackParamList>();

export function FriendsNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="FriendsList"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="FriendsList" component={FriendsScreen} />
      <Stack.Screen name="FriendSearch" component={FriendSearchScreen} />
      <Stack.Screen name="FriendRequests" component={FriendRequestsScreen} />
    </Stack.Navigator>
  );
}
