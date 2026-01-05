import React from "react";
import { render } from "@testing-library/react";
import ForgotPasswordPage from "@/app/[locale]/forgot-password/page";

// Mock the next-intl module
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth context
jest.mock("@features/auth/ui/context/auth-context", () => ({
  useAuth: jest.fn(() => ({ user: null })),
}));

// Mock other dependencies
jest.mock("next/navigation", () => ({
  useParams: () => ({ locale: "en" }),
}));

jest.mock("@/components/ui/button/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input/input", () => ({
  Input: (props: any) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  AlertDescription: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  AlertTitle: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock("lucide-react", () => ({
  KeyRound: () => <div />,
  MailCheck: () => <div />,
  User: () => <div />,
}));

jest.mock("@/features/marketing/ui/components/LandingLayout", () => ({
  LandingLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/features/auth/ui/components/AuthTemplate", () => ({
  AuthTemplate: ({ children, mode, error }: any) => (
    <div data-testid={`auth-template-${mode}`}>
      {error && <div data-testid="error-message">{error}</div>}
      {children}
    </div>
  ),
}));

jest.mock("@/lib/logger", () => ({
  productionLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

describe("ForgotPasswordPage", () => {
  it("renders correctly", () => {
    const { asFragment } = render(<ForgotPasswordPage />);
    expect(asFragment()).toMatchSnapshot();
  });
});
