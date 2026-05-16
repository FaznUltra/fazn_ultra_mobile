import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import {
  useNavigation,
  useRoute,
  CommonActions,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Button } from '../../../components/ui/Button';
import { colors, spacing } from '../../../theme';
import type { HomeStackParamList } from '../../../navigation/types';
import { CheckSvg } from './ChallengeIcons';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ChallengeSuccess'>;
type Rt = RouteProp<HomeStackParamList, 'ChallengeSuccess'>;

export function ChallengeSuccessScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const { gameLabel, opponentName } = route.params;

  const scale = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale, opacity]);

  const subtitle = opponentName
    ? `Challenge sent to ${opponentName}`
    : `Your ${gameLabel} challenge has been posted`;

  const goToArena = () =>
    navigation.dispatch(
      CommonActions.navigate({
        name: 'Arena',
        params: { screen: 'ArenaMain' },
      }),
    );

  const createAnother = () =>
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: 'Home',
            state: {
              index: 0,
              routes: [
                { name: 'HomeMain' },
                { name: 'SelectPlatform' },
              ],
            },
          },
        ],
      }),
    );

  return (
    <ScreenContainer testID="challenge-success-screen" noScroll>
      <View style={styles.body}>
        <Animated.View
          style={[
            styles.checkCircle,
            { transform: [{ scale }], opacity },
          ]}
          testID="success-check"
        >
          <CheckSvg size={56} color={colors.success} />
        </Animated.View>
        <Text style={styles.title}>Challenge Created! 🎮</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.actions}>
        <Button
          title="View in Arena"
          onPress={goToArena}
          testID="success-arena-btn"
        />
        <Button
          title="Create Another"
          variant="outline"
          onPress={createAnother}
          testID="success-create-another-btn"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actions: { gap: spacing.sm, paddingBottom: spacing.lg },
});
