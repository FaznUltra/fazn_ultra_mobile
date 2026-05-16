import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../screens/app/HomeScreen';
import { FriendsScreen } from '../screens/app/FriendsScreen';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ProfileScreen and ArenaScreen have their own dedicated test suites.

describe('Tab screens', () => {
  it('HomeScreen renders page name', () => {
    const { getByText, getByTestId } = render(<HomeScreen />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('FriendsScreen renders page name', () => {
    const { getByText, getByTestId } = render(<FriendsScreen />);
    expect(getByText('Friends')).toBeTruthy();
    expect(getByTestId('friends-screen')).toBeTruthy();
  });
});
