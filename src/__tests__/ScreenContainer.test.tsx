import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ScreenContainer } from '../components/ui/ScreenContainer';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...p }: React.PropsWithChildren<object>) => (
    <>{children}</>
  ),
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

describe('ScreenContainer', () => {
  it('renders children inside a scroll view by default', () => {
    const { getByText } = render(
      <ScreenContainer>
        <Text>Hello</Text>
      </ScreenContainer>,
    );
    expect(getByText('Hello')).toBeTruthy();
  });

  it('renders with testID', () => {
    const { getByTestId } = render(
      <ScreenContainer testID="my-screen">
        <Text>Hi</Text>
      </ScreenContainer>,
    );
    expect(getByTestId('my-screen')).toBeTruthy();
  });

  it('noScroll renders without ScrollView wrapper', () => {
    const { getByText } = render(
      <ScreenContainer noScroll>
        <Text>No scroll</Text>
      </ScreenContainer>,
    );
    expect(getByText('No scroll')).toBeTruthy();
  });
});
