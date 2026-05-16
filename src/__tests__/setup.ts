import '@testing-library/jest-native/extend-expect';

// Silence the act() / animation noise that react-navigation can emit in tests.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});

// expo-web-browser mock
jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: jest.fn().mockResolvedValue({ type: 'cancel' }),
  dismissBrowser: jest.fn(),
}));
