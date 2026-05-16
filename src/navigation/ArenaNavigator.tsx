import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ArenaStackParamList } from './types';
import { colors } from '../theme';
import { ArenaScreen } from '../screens/app/arena/ArenaScreen';
import { ChallengeDetailScreen } from '../screens/app/arena/ChallengeDetailScreen';

const Stack = createNativeStackNavigator<ArenaStackParamList>();

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
