import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../../theme';
import {
  HomeSvg,
  ArenaSvg,
  FriendsSvg,
  ProfileSvg,
  CreatePlusSvg,
} from '../create/CreateDrawerIcons';
import { CreateDrawer } from '../create/CreateDrawer';

const ICON_SIZE = 22;
const CREATE_SIZE = 52;

const TAB_ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  Home: HomeSvg,
  Arena: ArenaSvg,
  Friends: FriendsSvg,
  Profile: ProfileSvg,
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const paddingBottom = Math.max(insets.bottom, spacing.sm);

  return (
    <>
      <View style={[styles.bar, { paddingBottom }]}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];

          if (route.name === 'Create') {
            return (
              <TouchableOpacity
                key={route.key}
                style={styles.createWrap}
                onPress={() => setDrawerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Create"
                testID="tab-create"
              >
                <View style={styles.createBtn}>
                  <CreatePlusSvg size={28} color="#ffffff" />
                </View>
              </TouchableOpacity>
            );
          }

          const IconComponent = TAB_ICONS[route.name];
          const activeColor = colors.primaryLight;
          const inactiveColor = colors.textMuted;
          const iconColor = isFocused ? activeColor : inactiveColor;
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              style={styles.tab}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
              testID={`tab-${route.name.toLowerCase()}`}
            >
              {IconComponent && (
                <IconComponent size={ICON_SIZE} color={iconColor} />
              )}
              <Text style={[styles.label, { color: iconColor }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <CreateDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSelect={(id) => {
          // TODO: navigate to specific create flow
          console.log('Create selected:', id);
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    alignItems: 'flex-end',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: { elevation: 12 },
    }),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    paddingBottom: spacing.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
  createWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: spacing.xs,
  },
  createBtn: {
    width: CREATE_SIZE,
    height: CREATE_SIZE,
    borderRadius: CREATE_SIZE / 2,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
});
