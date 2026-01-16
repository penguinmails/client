import React from "react";
import { render, screen } from "@testing-library/react";
import SignUpFormView from "@/features/auth/ui/signup-form";
import { useFeature } from "@/lib/features";

// Mock the next-intl module
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth context
jest.mock("@features/auth/hooks/use-auth", () => ({
  useAuth: jest.fn(() => ({
    error: null,
    authLoading: { session: false, enrichment: false },
  })),
}));

// Mock other dependencies
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/lib/features", () => ({
  useFeature: jest.fn().mockReturnValue(true),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    register: jest.fn(() => ({})),
    handleSubmit: (fn: any) => fn,
    watch: jest.fn(),
    formState: { errors: {} },
  }),
  Controller: ({ render }: any) =>
    render({
      field: {
        value: "",
        onChange: jest.fn(),
        onBlur: jest.fn(),
        ref: jest.fn(),
      },
    }),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/features/auth/ui/components", () => ({
  PasswordInput: ({ onValueChange, ...props }: any) => (
    <input
      {...props}
      type="password"
      onChange={(e) => onValueChange?.(e.target.value)}
      data-testid="password-input"
    />
  ),
}));

jest.mock("@/components/ui/input/input", () => ({
  Input: (props: any) => <input {...props} data-testid="email-input" />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

jest.mock("next-turnstile", () => ({
  Turnstile: ({ onVerify }: { onVerify: (token: string) => void }) => {
    return (
      <div
        data-testid="turnstile-widget"
        onClick={() => onVerify("test-token")}
      />
    );
  },
}));

jest.mock("@/features/auth/lib/verify-token", () => ({
  verifyTurnstileToken: jest.fn().mockResolvedValue(true),
}));

describe("SignUpFormView", () => {
  it("renders correctly", () => {
    const { asFragment } = render(<SignUpFormView />);
    expect(asFragment()).toMatchSnapshot();
  });

  it("does not render Turnstile when feature is disabled", () => {
    // Override the mock to return false
    // We need to require it inside the test if we want to change the mock implementation dynamically
    // or we can just access the mock if it was imported.
    // Since we mocked it with jest.mock factory, we can access it via jest.mocked
    jest.mocked(useFeature).mockReturnValueOnce(false);

    render(<SignUpFormView />);
    expect(screen.queryByTestId("turnstile-widget")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("captcha-not-configured-message")
    ).not.toBeInTheDocument();
  });
});
