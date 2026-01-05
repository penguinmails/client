import React from 'react';
import { render } from '@testing-library/react';
import ForgotPasswordPage from '@app/[locale]/forgot-password/page';

// Mock the next-intl module
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('ForgotPasswordPage', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<ForgotPasswordPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
