import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenOverlayModule } = NativeModules;

// Native module is only available on physical devices (not simulator)
const isAvailable = !!ScreenOverlayModule;
const emitter = isAvailable ? new NativeEventEmitter(ScreenOverlayModule) : null;

export type RecordingStateEvent = {
  isRecording: boolean;
  stopping?: boolean;
  filePath?: string;
};

const unavailable = () => Promise.reject(new Error('ScreenOverlay not available on this device'));

export const ScreenOverlay = {
  isAvailable,
  show: (): Promise<string> => isAvailable ? ScreenOverlayModule.showOverlay() : unavailable(),
  hide: (): Promise<string> => isAvailable ? ScreenOverlayModule.hideOverlay() : unavailable(),
  startRecording: (): Promise<string> => isAvailable ? ScreenOverlayModule.startRecording() : unavailable(),
  stopRecording: (): Promise<string> => isAvailable ? ScreenOverlayModule.stopRecording() : unavailable(),

  onRecordingStateChanged: (callback: (event: RecordingStateEvent) => void) => {
    if (!emitter) return { remove: () => {} };
    const eventName = Platform.OS === 'android' ? 'onRecordingStateChanged' : 'onRecordingStateChanged';
    return emitter.addListener(eventName, callback);
  },
};
