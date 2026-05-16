import '@testing-library/jest-native/extend-expect';

// Silence the act() / animation noise that react-navigation can emit in tests.
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper', () => ({}), {
  virtual: true,
});

// WebView mock — tests that render PaystackSheet get a plain View
jest.mock('react-native-webview', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props: object) => React.createElement(View, { testID: 'webview', ...props }),
    WebView: (props: object) => React.createElement(View, { testID: 'webview', ...props }),
  };
});
