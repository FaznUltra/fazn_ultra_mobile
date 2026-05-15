import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from './types';
import { TabBar } from '../components/navigation/TabBar';
import { HomeScreen } from '../screens/app/HomeScreen';
import { ArenaScreen } from '../screens/app/ArenaScreen';
import { FriendsScreen } from '../screens/app/FriendsScreen';
import { ProfileScreen } from '../screens/app/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Placeholder — Create tab never actually renders a screen (handled by TabBar)
function CreatePlaceholder() {
  return null;
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      id={undefined}
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Arena" component={ArenaScreen} />
      <Tab.Screen name="Create" component={CreatePlaceholder} />
      <Tab.Screen name="Friends" component={FriendsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
