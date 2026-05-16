import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { colors, radius } from '../../theme';

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

interface Props {
  items: string[];
  selectedIndex: number;
  onIndexChange: (i: number) => void;
  width?: number;
  testID?: string;
}

export function WheelPicker({ items, selectedIndex, onIndexChange, width = 70, testID }: Props) {
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    ref.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
  }, [selectedIndex]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    onIndexChange(clamped);
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    onIndexChange(clamped);
  };

  const padded = [
    ...Array(PAD).fill(''),
    ...items,
    ...Array(PAD).fill(''),
  ];

  return (
    <View style={[styles.container, { width }]} testID={testID}>
      <View style={styles.selectionBar} pointerEvents="none" />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumEnd}
        onScrollEndDrag={onScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: 0 }}
        style={{ height: ITEM_H * VISIBLE }}
      >
        {padded.map((label, idx) => {
          const itemIdx = idx - PAD;
          const active = itemIdx === selectedIndex;
          return (
            <View key={idx} style={styles.item}>
              <Text style={[styles.itemText, active && styles.itemTextActive]}>
                {label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  selectionBar: {
    position: 'absolute',
    top: ITEM_H * PAD,
    left: 0,
    right: 0,
    height: ITEM_H,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    zIndex: 1,
  },
  item: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: {
    color: colors.textMuted,
    fontSize: 17,
    fontWeight: '400',
  },
  itemTextActive: {
    color: colors.textPrimary,
    fontSize: 19,
    fontWeight: '600',
  },
});
