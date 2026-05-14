import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenOverlayModule } = NativeModules;

if (!ScreenOverlayModule) {
  throw new Error(
    'ScreenOverlayModule not found. Make sure you have rebuilt the native app after adding the module.'
  );
}

const emitter = new NativeEventEmitter(ScreenOverlayModule);

export type RecordingStateEvent = {
  isRecording: boolean;
  stopping?: boolean;
  filePath?: string;
};

export const ScreenOverlay = {
  show: (): Promise<string> => ScreenOverlayModule.showOverlay(),
  hide: (): Promise<string> => ScreenOverlayModule.hideOverlay(),
  startRecording: (): Promise<string> => ScreenOverlayModule.startRecording(),
  stopRecording: (): Promise<string> => ScreenOverlayModule.stopRecording(),

  // Single event fired whenever recording starts or stops — from ANY source (widget or JS button)
  onRecordingStateChanged: (callback: (event: RecordingStateEvent) => void) => {
    const eventName = Platform.OS === 'android' ? 'onRecordingStateChanged' : 'onRecordingStateChanged';
    return emitter.addListener(eventName, callback);
  },
};
