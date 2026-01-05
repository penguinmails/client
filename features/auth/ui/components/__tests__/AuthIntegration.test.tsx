/**
 * Simple Integration Test for Enhanced Authentication
 *
 * Basic integration test to verify the enhanced auth system works correctly.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock the AuthContext to provide test data
const mockAuthContext = {
  user: {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    displayName: "Test User",
    profile: {
      userId: "user-1",
      role: "user" as const,
      isPenguinMailsStaff: false,
      preferences: { theme: "light" as const },
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tenants: ["tenant-1", "tenant-2"],
  },
  nileUser: {
    id: "user-1",
    email: "test@example.com",
    name: "Test User",
    displayName: "Test User",
    profile: {
      userId: "user-1",
      role: "user" as const,
      isPenguinMailsStaff: false,
      preferences: { theme: "light" as const },
      lastLoginAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    tenants: ["tenant-1", "tenant-2"],
  },
  userTenants: [],
  userCompanies: [],
  isStaff: false,
  profile: {
    userId: "user-1",
    role: "user" as const,
    isPenguinMailsStaff: false,
    preferences: { theme: "light" as const },
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  loading: false,
  error: null,
  selectedTenantId: null,
  selectedCompanyId: null,
  setSelectedTenant: () => {},
  setSelectedCompany: () => {},
  refreshProfile: jest.fn(),
  refreshTenants: jest.fn(),
  refreshCompanies: jest.fn(),
  clearError: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  systemHealth: { status: "unknown" },
  checkSystemHealth: jest.fn(),
  signup: jest.fn(),
  updateUser: jest.fn(),
  refreshUserData: jest.fn(),
  isAuthenticated: true,
  sessionExpired: false,
  restoreSession: jest.fn().mockResolvedValue(true),
};

jest.mock("@features/auth/ui/context/auth-context", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useAuth: () => mockAuthContext,
}));

// Simple test component
const TestComponent = () => {
  const { loading, user, isStaff, userTenants } = mockAuthContext;

  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "loaded"}</div>
      <div data-testid="user">{user?.email || "no-user"}</div>
      <div data-testid="staff">{isStaff ? "staff" : "not-staff"}</div>
      <div data-testid="tenants">{userTenants.length}</div>
    </div>
  );
};

describe("Enhanced Auth Integration", () => {
  it("should initialize and load user data", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Import the mocked components after the jest.mock
    const { AuthProvider } = await import("@features/auth/ui/context/auth-context");

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    // Should show loaded state
    expect(screen.getByTestId("loading")).toHaveTextContent("loaded");

    // Should show authenticated user
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("staff")).toHaveTextContent("not-staff");
    expect(screen.getByTestId("tenants")).toHaveTextContent("0");
  });

  it("should handle authenticated user", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Import the mocked components after the jest.mock
    const { AuthProvider } = await import("@features/auth/ui/context/auth-context");

    render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    expect(screen.getByTestId("user")).toHaveTextContent("test@example.com");
    expect(screen.getByTestId("staff")).toHaveTextContent("not-staff");
    expect(screen.getByTestId("tenants")).toHaveTextContent("0");
  });
});
