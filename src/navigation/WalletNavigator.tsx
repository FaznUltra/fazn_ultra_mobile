import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { WalletStackParamList } from './types';
import { colors } from '../theme';
import { WalletScreen } from '../screens/app/wallet/WalletScreen';
import { AddFundsScreen } from '../screens/app/wallet/AddFundsScreen';
import { WithdrawScreen } from '../screens/app/wallet/WithdrawScreen';
import { TransactionsScreen } from '../screens/app/wallet/TransactionsScreen';

const Stack = createNativeStackNavigator<WalletStackParamList>();

export function WalletNavigator() {
  return (
    <Stack.Navigator
      id={undefined}
      initialRouteName="WalletMain"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="WalletMain" component={WalletScreen} />
      <Stack.Screen
        name="AddFunds"
        component={AddFundsScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
    </Stack.Navigator>
  );
}
