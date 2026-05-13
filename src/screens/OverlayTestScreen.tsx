import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { ScreenOverlay } from '../modules/ScreenOverlay';

export default function OverlayTestScreen() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [recording, setRecording] = useState(false);
  const [lastSavedPath, setLastSavedPath] = useState<string | null>(null);

  useEffect(() => {
    const sub = ScreenOverlay.onRecordingSaved((filePath) => {
      setRecording(false);
      setLastSavedPath(filePath);
      Alert.alert('Recording Saved', `File saved to:\n${filePath}`);
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
    setRecording(false);
  };

  const handleStartRecording = async () => {
    try {
      await ScreenOverlay.startRecording();
      setRecording(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const handleStopRecording = async () => {
    try {
      const path = await ScreenOverlay.stopRecording();
      setRecording(false);
      if (Platform.OS === 'ios') {
        // iOS shows the native ReplayKit preview sheet automatically
        Alert.alert('Recording Stopped', 'The ReplayKit preview sheet should appear.');
      } else {
        setLastSavedPath(path);
        Alert.alert('Recording Saved', `File saved to:\n${path}`);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Overlay & Recording Test</Text>
      <Text style={styles.subtitle}>
        Platform: {Platform.OS.toUpperCase()}
      </Text>

      <View style={styles.card}>
        <Text style={styles.label}>Overlay</Text>
        <TouchableOpacity
          style={[styles.button, overlayVisible ? styles.danger : styles.primary]}
          onPress={overlayVisible ? handleHideOverlay : handleShowOverlay}
        >
          <Text style={styles.buttonText}>
            {overlayVisible ? 'Hide Overlay' : 'Show Overlay'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Recording (manual control)</Text>
        <TouchableOpacity
          style={[styles.button, recording ? styles.danger : styles.success]}
          onPress={recording ? handleStopRecording : handleStartRecording}
        >
          <Text style={styles.buttonText}>
            {recording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
      </View>

      {lastSavedPath && (
        <View style={styles.pathCard}>
          <Text style={styles.pathLabel}>Last saved file:</Text>
          <Text style={styles.path}>{lastSavedPath}</Text>
        </View>
      )}

      <Text style={styles.hint}>
        Tip: tap the red REC button that appears on screen to toggle recording from the overlay itself.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#0f0f0f', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 32 },
  card: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  label: { color: '#aaa', fontSize: 13, marginBottom: 10 },
  button: { borderRadius: 8, padding: 14, alignItems: 'center' },
  primary: { backgroundColor: '#3b82f6' },
  danger: { backgroundColor: '#ef4444' },
  success: { backgroundColor: '#22c55e' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  pathCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 16 },
  pathLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  path: { color: '#fff', fontSize: 12, fontFamily: 'monospace' },
  hint: { color: '#555', fontSize: 12, textAlign: 'center', marginTop: 24 },
});
