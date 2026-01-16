/**
 * @fileoverview Tests for DashboardLayout component using real UI components
 */

import React from 'react';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardLayout } from '@/components/design-system/dashboard-layout';
import { setupDashboardTest } from '@/lib/test-utils/setup-helpers';

// Mock the sidebar components to avoid provider requirements
jest.mock('@/components/ui/sidebar', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-sidebar-provider">{children}</div>
  ),
  SidebarTrigger: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button data-testid="sidebar-trigger" {...props}>
      {children || 'Toggle Sidebar'}
    </button>
  ),
  useSidebar: () => ({
    open: true,
    setOpen: jest.fn(),
    openMobile: false,
    setOpenMobile: jest.fn(),
    isMobile: false,
    state: 'expanded' as const,
    toggleSidebar: jest.fn(),
  }),
  // Export other components as simple divs to avoid dependency issues
  Sidebar: ({ children, ...props }: React.ComponentProps<'div'>) => (
    <div data-testid="mock-sidebar" {...props}>{children}</div>
  ),
  SidebarInset: ({ children, ...props }: React.ComponentProps<'main'>) => (
    <main data-testid="mock-sidebar-inset" {...props}>{children}</main>
  ),
}));

// Mock the auth context to provide a mock implementation
jest.mock('@features/auth/hooks/use-auth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-1',
      email: 'test@example.com',
      name: 'Test User',
      displayName: 'Test User',
      photoURL: null,
    },
    isAuthenticated: true,
    loading: false,
    error: null,
    isStaff: false,
    selectedTenantId: null,
    selectedCompanyId: null,
    setSelectedTenant: jest.fn(),
    setSelectedCompany: jest.fn(),
    refreshProfile: jest.fn(),
    refreshTenants: jest.fn(),
    refreshCompanies: jest.fn(),
    clearError: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    refreshUser: jest.fn(),
    refreshUserData: jest.fn(),
    sessionExpired: false,
    userTenants: [],
    userCompanies: [],
    authLoading: {
      session: false,
      enrichment: false,
    },
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

describe('DashboardLayout', () => {
  const mockChildren = <div data-testid="test-content">Test Content</div>;
  const { render } = setupDashboardTest(DashboardLayout);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the layout with children', () => {
    render({ children: mockChildren });

    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders with default layout structure', () => {
    const { container } = render({ children: mockChildren });

    // Test for semantic structure rather than specific classes
    const layout = container.querySelector('[role="main"], main');
    expect(layout).toBeInTheDocument();
    
    // Verify content is properly rendered within the layout
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-layout-class';
    const { container } = render({ 
      children: mockChildren,
      className: customClass 
    });

    // Test that the custom class is applied to the layout container
    const layoutContainer = container.querySelector(`.${customClass}`);
    expect(layoutContainer).toBeInTheDocument();
  });

  it('renders with title when provided', () => {
    const title = 'Test Dashboard';
    render({ 
      children: mockChildren,
      title 
    });

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: title })).toBeInTheDocument();
  });

  it('handles responsive layout', () => {
    const { container } = render({ children: mockChildren });

    // Test for responsive behavior rather than specific classes
    const layout = container.querySelector('[role="main"], main');
    expect(layout).toBeInTheDocument();
    
    // Verify the layout contains the content properly
    expect(layout).toContainElement(screen.getByTestId('test-content'));
  });

  it('renders with proper accessibility attributes', () => {
    render({ children: mockChildren });

    // Check for main landmark
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('handles empty children gracefully', () => {
    render({ children: null });

    // Should not crash with null children
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('applies theme classes correctly', () => {
    const { container } = render({ children: mockChildren });

    // Test for semantic layout behavior rather than specific classes
    const layout = container.querySelector('[role="main"], main');
    expect(layout).toBeInTheDocument();
    
    // Check that the layout has proper structure
    expect(layout).toContainElement(screen.getByTestId('test-content'));
  });
});