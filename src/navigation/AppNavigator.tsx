import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { TabParamList } from './types';
import { TabBar } from '../components/navigation/TabBar';
import { HomeNavigator } from './HomeNavigator';
import { ArenaNavigator } from './ArenaNavigator';
import { FriendsNavigator } from './FriendsNavigator';
import { ProfileNavigator } from './ProfileNavigator';

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
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="Arena" component={ArenaNavigator} />
      <Tab.Screen name="Create" component={CreatePlaceholder} />
      <Tab.Screen name="Friends" component={FriendsNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
