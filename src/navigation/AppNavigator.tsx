import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';
import { colors } from '../theme';
import OverlayTestScreen from '../screens/OverlayTestScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {/* Existing overlay/recording feature — preserved as the app's home. */}
      <Stack.Screen name="OverlayTest" component={OverlayTestScreen} />
    </Stack.Navigator>
  );
}
