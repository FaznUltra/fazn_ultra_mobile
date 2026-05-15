import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

let ScreenOverlayModule: Record<string, (...args: unknown[]) => Promise<string>> | null = null;
try {
  ScreenOverlayModule = NativeModules.ScreenOverlayModule ?? null;
} catch {
  // Module not linked in this build (simulator or non-overlay build)
}

const isAvailable = !!ScreenOverlayModule;
const emitter = isAvailable ? new NativeEventEmitter(ScreenOverlayModule as never) : null;

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
