import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface Props {
  avatarUrl?: string | null;
  firstName: string;
  lastName: string;
  size?: number;
  testID?: string;
}

export function Avatar({ avatarUrl, firstName, lastName, size = 88, testID }: Props) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const fontSize = size * 0.36;

  return (
    <View
      style={[styles.ring, { width: size + 6, height: size + 6, borderRadius: (size + 6) / 2 }]}
      testID={testID}
    >
      <View style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}>
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            resizeMode="cover"
            testID="avatar-image"
          />
        ) : (
          <View style={[styles.initialsWrap, { width: size, height: size, borderRadius: size / 2 }]}>
            <Text style={[styles.initials, { fontSize }]} testID="avatar-initials">
              {initials}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  initialsWrap: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.primaryLight,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
