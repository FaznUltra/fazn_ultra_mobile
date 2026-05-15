import '@testing-library/jest-native/extend-expect';

// Silence the act() / animation noise that react-navigation can emit in tests.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});
