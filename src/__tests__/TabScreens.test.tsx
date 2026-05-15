import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeScreen } from '../screens/app/HomeScreen';
import { ArenaScreen } from '../screens/app/ArenaScreen';
import { FriendsScreen } from '../screens/app/FriendsScreen';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: React.PropsWithChildren<object>) => <>{children}</>,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// ProfileScreen has its own dedicated test suite in ProfileScreen.test.tsx

describe('Tab screens', () => {
  it('HomeScreen renders page name', () => {
    const { getByText, getByTestId } = render(<HomeScreen />);
    expect(getByText('Home')).toBeTruthy();
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('ArenaScreen renders page name', () => {
    const { getByText, getByTestId } = render(<ArenaScreen />);
    expect(getByText('Arena')).toBeTruthy();
    expect(getByTestId('arena-screen')).toBeTruthy();
  });

  it('FriendsScreen renders page name', () => {
    const { getByText, getByTestId } = render(<FriendsScreen />);
    expect(getByText('Friends')).toBeTruthy();
    expect(getByTestId('friends-screen')).toBeTruthy();
  });
});
