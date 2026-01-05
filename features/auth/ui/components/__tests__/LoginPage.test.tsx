import React from 'react';
import { render } from '@testing-library/react';
import LoginPage from '@app/[locale]/page';

// Mock the next-intl module
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('LoginPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<LoginPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
