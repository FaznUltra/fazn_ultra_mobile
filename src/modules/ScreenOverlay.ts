import { NativeModules, NativeEventEmitter, Platform } from 'react-native';

const { ScreenOverlayModule } = NativeModules;

if (!ScreenOverlayModule) {
  throw new Error(
    'ScreenOverlayModule not found. Make sure you have rebuilt the native app after adding the module.'
  );
}

const emitter = new NativeEventEmitter(ScreenOverlayModule);

export const ScreenOverlay = {
  /** Show the floating overlay button on screen */
  show: (): Promise<string> => ScreenOverlayModule.showOverlay(),

  /** Hide and remove the floating overlay button */
  hide: (): Promise<string> => ScreenOverlayModule.hideOverlay(),

  /** Start screen recording (Android: triggers permission dialog) */
  startRecording: (): Promise<string> => ScreenOverlayModule.startRecording(),

  /** Stop recording and save to device. Resolves with the saved file path. */
  stopRecording: (): Promise<string> => ScreenOverlayModule.stopRecording(),

  /**
   * Android only: listen for when a recording is saved.
   * iOS uses the native ReplayKit preview sheet instead.
   */
  onRecordingSaved: (callback: (filePath: string) => void) => {
    if (Platform.OS === 'android') {
      return emitter.addListener('onRecordingSaved', callback);
    }
    return { remove: () => {} };
  },
};
