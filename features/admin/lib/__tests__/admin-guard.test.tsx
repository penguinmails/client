import { render, screen, act } from "@testing-library/react";
import { AdminGuard, useAdminAccess } from "../admin-guard";
import { AdminRole } from "@/features/auth/types/base";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";

// Mocks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("lucide-react", () => ({
  Loader2: () => <div data-testid="loader" />,
}));

describe("AdminGuard", () => {
  const mockRouter = {
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it("shows loading state when auth is loading", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(
      <AdminGuard allowedRoles={[AdminRole.OWNER]}>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByTestId("loader")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("redirects to login when no user is present", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(
      <AdminGuard allowedRoles={[AdminRole.OWNER]}>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(mockRouter.replace).toHaveBeenCalledWith("/login");
  });

  it("redirects to access-denied when user has no role", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "1", email: "test@test.com" }, // No role
      loading: false,
    });

    render(
      <AdminGuard allowedRoles={[AdminRole.OWNER]}>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(mockRouter.replace).toHaveBeenCalledWith("/access-denied");
  });

  it("redirects to access-denied when user has wrong role", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "1", email: "test@test.com", role: AdminRole.SUPPORT },
      loading: false,
    });

    render(
      <AdminGuard allowedRoles={[AdminRole.OWNER]}>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(mockRouter.replace).toHaveBeenCalledWith("/access-denied");
  });

  it("renders children when user has correct role", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "1", email: "manager@test.com", role: AdminRole.ADMIN },
      loading: false,
    });

    // Requesting ADMIN or OWNER
    render(
      <AdminGuard allowedRoles={[AdminRole.OWNER, AdminRole.ADMIN]}>
        <div>Protected Content</div>
      </AdminGuard>
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
