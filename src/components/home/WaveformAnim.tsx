import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme';

const BARS = [8, 14, 10, 16];
const MIN_HEIGHT = 4;

interface Props {
  isPlaying: boolean;
  testID?: string;
}

export function WaveformAnim({ isPlaying, testID }: Props) {
  const anims = useRef(BARS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!isPlaying) {
      anims.forEach((a) => a.stopAnimation());
      anims.forEach((a) => a.setValue(0));
      return;
    }

    const loops = anims.map((a, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(a, {
            toValue: 1,
            duration: 350 + i * 90,
            useNativeDriver: false,
          }),
          Animated.timing(a, {
            toValue: 0,
            duration: 350 + i * 90,
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [isPlaying, anims]);

  return (
    <View style={styles.row} testID={testID ?? 'waveform-anim'}>
      {BARS.map((peak, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              height: isPlaying
                ? anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [MIN_HEIGHT, peak],
                  })
                : MIN_HEIGHT,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 18,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: colors.primaryLight,
  },
});
