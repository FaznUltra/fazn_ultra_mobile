import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { ScreenOverlay } from '../modules/ScreenOverlay';

export default function OverlayTestScreen() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [recording, setRecording] = useState(false);
  const [stopping, setStopping] = useState(false);
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null);

  // Single listener for recording state — covers both floating button and JS buttons
  useEffect(() => {
    const sub = ScreenOverlay.onRecordingStateChanged(({ isRecording, filePath }) => {
      setRecording(isRecording);
      if (!isRecording && filePath) {
        setLastSavedPath(filePath);
        Alert.alert('Recording Saved', `File saved to:\n${filePath}`);
      }
    });
    return () => sub.remove();
  }, []);

  const handleShowOverlay = async () => {
    try {
      await ScreenOverlay.show();
      setOverlayVisible(true);
    } catch (e: any) {
      if (e.code === 'NO_PERMISSION' && Platform.OS === 'android') {
        Alert.alert(
          'Permission Required',
          'Please enable "Display over other apps" for this app in Settings.',
          [{ text: 'Open Settings', onPress: () => Linking.openSettings() }, { text: 'Cancel' }]
        );
      } else {
        Alert.alert('Error', e.message);
      }
    }
  };

  const handleHideOverlay = async () => {
    await ScreenOverlay.hide();
    setOverlayVisible(false);
  };

  const handleToggleRecording = async () => {
    if (recording) {
      await ScreenOverlay.stopRecording();
      // State update comes via onRecordingStateChanged event from native
    } else {
      await ScreenOverlay.startRecording();
      // Broadcast picker shown — recording starts when user confirms
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overlay & Recording Test</Text>
      <Text style={styles.subtitle}>Platform: {Platform.OS.toUpperCase()}</Text>

      {recording && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>● RECORDING</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.label}>Floating Widget</Text>
        <TouchableOpacity
          style={[styles.button, overlayVisible ? styles.danger : styles.primary]}
          onPress={overlayVisible ? handleHideOverlay : handleShowOverlay}
        >
          <Text style={styles.buttonText}>
            {overlayVisible ? 'Hide Widget' : 'Show Widget'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Recording</Text>
        <TouchableOpacity
          style={[styles.button, stopping ? styles.stopping : recording ? styles.danger : styles.success]}
          onPress={handleToggleRecording}
          disabled={stopping}
        >
          {stopping ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {recording ? 'Stop Recording' : 'Start Recording'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {lastSavedPath && (
        <View style={styles.pathCard}>
          <Text style={styles.pathLabel}>Last saved file:</Text>
          <Text style={styles.path}>{lastSavedPath}</Text>
        </View>
      )}

      <Text style={styles.hint}>
        The floating widget and this button share the same recording state.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0f0f0f', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  button: { borderRadius: 8, padding: 14, alignItems: 'center' },
  primary: { backgroundColor: '#3b82f6' },
  danger: { backgroundColor: '#ef4444' },
  success: { backgroundColor: '#22c55e' },
  stopping: { backgroundColor: '#f97316' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  pathCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  pathLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  path: { color: '#fff', fontSize: 12, fontFamily: 'monospace' },
  hint: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 16 },
});
