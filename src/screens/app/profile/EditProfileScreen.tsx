import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '../../../navigation/types';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { Avatar } from '../../../components/profile/Avatar';
import { ChevronLeftIcon, CloseIcon } from '../../../components/profile/ProfileIcons';
import { useAuthStore } from '../../../store/auth.store';
import { profileApi, ApiError } from '../../../lib/api';
import { colors, spacing, radius } from '../../../theme';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const BIO_MAX = 160;
const INITIAL_TAGS = ['PS5 Player', 'FIFA', 'COD'];

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  testID: string;
  prefix?: string;
  multiline?: boolean;
  maxLength?: number;
  numberOfLines?: number;
}

function Field({
  label,
  value,
  onChangeText,
  testID,
  prefix,
  multiline,
  maxLength,
  numberOfLines,
}: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          multiline && styles.inputWrapMultiline,
          focused && styles.inputWrapFocused,
        ]}
      >
        {prefix ? <Text style={styles.prefix}>{prefix}</Text> : null}
        <TextInput
          testID={testID}
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textMuted}
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={numberOfLines}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
      </View>
    </View>
  );
}

export function EditProfileScreen({ navigation }: Props) {
  const user = useAuthStore((s) => s.user);

  const initial = useMemo(
    () => ({
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      username: user?.username ?? '',
      bio: '',
      tags: INITIAL_TAGS,
    }),
    [user],
  );

  const [firstName, setFirstName] = useState(initial.firstName);
  const [lastName, setLastName] = useState(initial.lastName);
  const [username, setUsername] = useState(initial.username);
  const [bio, setBio] = useState(initial.bio);
  const [tags, setTags] = useState<string[]>(initial.tags);
  const [saving, setSaving] = useState(false);

  const dirty =
    firstName !== initial.firstName ||
    lastName !== initial.lastName ||
    username !== initial.username ||
    bio !== initial.bio ||
    tags.length !== initial.tags.length ||
    tags.some((t, i) => t !== initial.tags[i]);

  const removeTag = (tag: string) =>
    setTags((prev) => prev.filter((t) => t !== tag));

  const onSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing info', 'First and last name are required.');
      return;
    }
    setSaving(true);
    try {
      await profileApi.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        tags,
      });
      navigation.goBack();
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Failed to save profile. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer testID="edit-profile-screen">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          testID="edit-back-btn"
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={10}
        >
          <ChevronLeftIcon size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <TouchableOpacity
          onPress={onSave}
          disabled={!dirty || saving}
          testID="edit-save-btn"
          accessibilityRole="button"
          accessibilityLabel="Save"
          accessibilityState={{ disabled: !dirty || saving }}
          hitSlop={10}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.primaryLight} />
          ) : (
            <Text style={[styles.save, (!dirty || saving) && styles.saveDisabled]}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.avatarSection}>
        <Avatar
          firstName={firstName || ' '}
          lastName={lastName || ' '}
          size={90}
        />
        <TouchableOpacity
          onPress={() => Alert.alert('Coming soon', 'Photo upload is coming soon.')}
          testID="edit-change-photo"
          accessibilityRole="button"
        >
          <Text style={styles.changePhoto}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <Field
        label="First Name"
        value={firstName}
        onChangeText={setFirstName}
        testID="edit-first-name"
      />
      <Field
        label="Last Name"
        value={lastName}
        onChangeText={setLastName}
        testID="edit-last-name"
      />
      <Field
        label="Username"
        value={username}
        onChangeText={setUsername}
        testID="edit-username"
        prefix="@"
      />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Bio</Text>
        <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
          <TextInput
            testID="edit-bio"
            style={[styles.input, styles.inputMultiline]}
            value={bio}
            onChangeText={setBio}
            placeholder="Tell others about yourself"
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            maxLength={BIO_MAX}
            textAlignVertical="top"
          />
        </View>
        <Text style={styles.counter} testID="edit-bio-counter">
          {bio.length}/{BIO_MAX}
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Gaming Tags</Text>
        <View style={styles.chips}>
          {tags.map((tag) => (
            <View key={tag} style={styles.chip} testID={`edit-tag-${tag}`}>
              <Text style={styles.chipText}>{tag}</Text>
              <TouchableOpacity
                onPress={() => removeTag(tag)}
                testID={`edit-tag-remove-${tag}`}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${tag}`}
                hitSlop={8}
              >
                <CloseIcon size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addChip}
            onPress={() => Alert.alert('Coming soon', 'Adding tags is coming soon.')}
            testID="edit-add-tag"
            accessibilityRole="button"
          >
            <Text style={styles.addChipText}>+ Add tag</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  save: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  saveDisabled: {
    color: colors.textMuted,
  },
  avatarSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  changePhoto: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  inputWrapMultiline: {
    alignItems: 'flex-start',
    minHeight: 96,
  },
  inputWrapFocused: {
    borderColor: colors.primaryLight,
  },
  prefix: {
    color: colors.textMuted,
    fontSize: 15,
    marginRight: 2,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 72,
  },
  counter: {
    alignSelf: 'flex-end',
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  addChip: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  addChipText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '600',
  },
});
