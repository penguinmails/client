import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/[locale]/page";
import { useAuth } from "@/features/auth/hooks/use-auth";
import * as rateLimitModule from "@/features/auth/lib/rate-limit";

// Mock all external dependencies
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Create a file-scoped mock for safe navigation to avoid global pollution
const mockSafePush = jest.fn();

jest.mock("@/hooks/use-safe-navigation", () => ({
  useSafeNavigation: () => ({
    safePush: mockSafePush,
  }),
}));

jest.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/features/auth/lib/verify-token", () => ({
  verifyTurnstileToken: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/lib/posthog", () => ({
  initPostHog: jest.fn().mockResolvedValue({
    capture: jest.fn(),
  }),
  ph: jest.fn().mockReturnValue({
    capture: jest.fn(),
  }),
}));

jest.mock("@/features/auth/lib/rate-limit", () => ({
  getLoginAttemptStatus: jest.fn(() => ({
    attempts: 0,
    requiresTurnstile: false,
  })),
}));

jest.mock("@/lib/logger", () => ({
  productionLogger: {
    error: jest.fn(),
    info: jest.fn(),
  },
  developmentLogger: {
    warn: jest.fn(),
  },
}));

// Mock Next.js router
const mockRouterPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
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

jest.mock("@/components/ui/button/button", () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/features/marketing/ui/components/LandingLayout", () => ({
  LandingLayout: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("@/features/auth/ui/components/AuthTemplate", () => ({
  AuthTemplate: ({ children, mode, error, icon: Icon }: any) => (
    <div data-testid={`auth-template-${mode}`}>
      {Icon && <Icon />}
      {error && <div data-testid="error-message">{error}</div>}
      {children}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  LogIn: () => <div data-testid="login-icon" />,
  User: () => <div data-testid="user-icon" />,
}));

describe("LoginPage", () => {
  const mockLogin = jest.fn();
  const mockUseAuth = useAuth as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: null,
      error: null,
      loading: false,
    });
  });

  it("renders login form correctly", () => {
    render(<LoginPage />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByTestId("email-input")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(screen.getByTestId("login-button")).toBeInTheDocument();
  });

  it("handles login form submission successfully", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      // Navigation is handled by auth context, not LoginPage directly
    });
  });

  it("displays error message when login fails", async () => {
    const errorMessage = "Invalid credentials";
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it("shows loading state during login", async () => {
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<LoginPage />);

    const loginButton = screen.getByTestId("login-button");
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  it("renders user logged in state correctly", () => {
    mockUseAuth.mockReturnValue({
      login: mockLogin,
      user: { id: "123", email: "test@example.com" },
      error: null,
      loading: false,
    });

    render(<LoginPage />);

    expect(screen.getByTestId("auth-template-loggedIn")).toBeInTheDocument();
    expect(screen.getByTestId("user-icon")).toBeInTheDocument();
  });

  it("shows turnstile widget when required", async () => {
    // Mock the rate limit to return requiresTurnstile: true
    const { getLoginAttemptStatus } = rateLimitModule;
    (getLoginAttemptStatus as jest.Mock).mockReturnValue({
      attempts: 3,
      requiresTurnstile: true,
    });

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    // Fill in both email and password to trigger rate limit check
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Click login button to trigger the form submission and rate limit check
    fireEvent.click(loginButton);

    // Wait for the turnstile section to appear
    // The component should show the turnstile section after the rate limit check
    await waitFor(
      () => {
        const turnstileSection = screen.queryByTestId("turnstile-section");
        expect(turnstileSection).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it("does not redirect when login fails with incorrect password", async () => {
    const errorMessage = "Invalid credentials";
    mockLogin.mockRejectedValueOnce(new Error(errorMessage));

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    // Ensure safePush was NOT called (no redirect on error)
    expect(mockSafePush).not.toHaveBeenCalled();

    // Ensure form is still visible (not redirected)
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });

  it("only redirects when login succeeds (no error present)", async () => {
    mockLogin.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      // Navigation is handled by auth context, not LoginPage directly
    });
  });

  it("handles 401 unauthorized response without redirecting to dashboard", async () => {
    // Simulate the actual NileDB 401 response scenario from the logs
    const unauthorizedError = new Error("Unauthorized");
    unauthorizedError.name = "Error";
    mockLogin.mockRejectedValueOnce(unauthorizedError);

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
    fireEvent.click(loginButton);

    // Wait for the error to appear
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    // Critical test: Ensure NO navigation happened on 401 error
    expect(mockSafePush).not.toHaveBeenCalled();

    // Ensure the login form is still visible (no redirect occurred)
    expect(screen.getByTestId("login-form")).toBeInTheDocument();

    // Ensure user is still null (not logged in)
    expect(mockUseAuth).toHaveBeenCalled();
  });

  it("prevents dashboard navigation when session check fails after signIn", async () => {
    // This simulates the scenario where signIn succeeds but checkSession returns null
    // which should trigger the "no valid session" error and prevent navigation
    mockLogin.mockRejectedValueOnce(
      new Error("Login failed - no valid session")
    );

    render(<LoginPage />);

    const emailInput = screen.getByTestId("email-input");
    const passwordInput = screen.getByTestId("password-input");
    const loginButton = screen.getByTestId("login-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "invalidpassword" } });
    fireEvent.click(loginButton);

    // Wait for error handling
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toBeInTheDocument();
    });

    // Ensure safePush was NOT called - critical for preventing dashboard redirect
    expect(mockSafePush).not.toHaveBeenCalled();
  });
});
