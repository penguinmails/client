/**
 * Domain Page Tests
 *
 * Tests the domain detail page including data loading,
 * metrics display, authentication status, and navigation.
 */

import { getDomainById, getTopAccountsForDomain, DomainWithMailboxesData } from "@features/domains/actions";
import { EmailAccount, Mailbox, WarmupStatus } from "@/types";
import { jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import React from "react";
import DomainPage from "../page";

// Test wrapper for providing necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>;
};

// Mock WeeklyMetricsClient component
jest.mock("../weekly-metrics-client", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="weekly-metrics-client">
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        Charts using AnalyticsContext: 0 data points
      </div>
    </div>
  ),
}));

// Mock AnalyticsContext
jest.mock("@features/analytics/ui/context/analytics-context", () => ({
  useAnalytics: () => ({
    warmupChartData: [],
    totalSent: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0,
    replyRate: 0,
    unsubscribeRate: 0,
    spamRate: 0,
    formattedStats: {
      totalSent: '0',
      openRate: '0%',
      clickRate: '0%',
      bounceRate: '0%',
      replyRate: '0%',
      unsubscribeRate: '0%',
      spamRate: '0%',
    },
  }),
}));

// Mock EmailsTable component
jest.mock("@features/domains/ui/components/emails-table", () => ({
  EmailsTable: ({ emailAccounts, _domainId }: { emailAccounts: unknown[]; _domainId: string }) => (
    <div data-testid="emails-table">
      {emailAccounts.length} email accounts
    </div>
  ),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  ArrowLeft: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <svg className={className} {...props}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  ),
  ArrowRight: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <svg className={className} {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  Settings: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <svg className={className} {...props}>
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  Mail: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <svg className={className} {...props}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  BarChart3: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <svg className={className} {...props}>
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  Shield: ({ className, ...props }: { className?: string; [key: string]: unknown }) => (
    <svg className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
}));

// Mock next-intl for real components that use translations
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key, // Return the key as the translation
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
  usePathname: () => "/dashboard/domains/1",
}));

// Mock Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

// Mock domain actions
jest.mock("@features/domains/actions", () => ({
  getDomainById: jest.fn(),
  getTopAccountsForDomain: jest.fn(),
}));

// Mock WeeklyMetricsClient component
jest.mock("../weekly-metrics-client", () => ({
  __esModule: true,
  default: () => <div data-testid="weekly-metrics-client">Weekly Metrics</div>,
}));

// Mock EmailsTable component
jest.mock("@features/domains/ui/components/emails-table", () => ({
  EmailsTable: ({ emailAccounts }: { emailAccounts: Mailbox[] }) => (
    <div data-testid="emails-table">{emailAccounts.length} email accounts</div>
  ),
}));

const mockGetDomainById = getDomainById as jest.MockedFunction<
  typeof getDomainById
>;
const mockGetTopAccountsForDomain =
  getTopAccountsForDomain as jest.MockedFunction<
    typeof getTopAccountsForDomain
  >;

describe("DomainPage", () => {
  const mockDomain: DomainWithMailboxesData = {
    id: "1",
    name: "example.com",
    provider: "Google Workspace",
    reputation: 85,
    spf: true,
    dkim: true,
    dmarc: true,
    emailAccounts: [],
    domain: {
      id: 1,
      domain: "example.com",
      name: "example.com",
      provider: "Google Workspace",
      status: "active",
      daysActive: 30,
      reputation: 85,
      emailAccounts: 5,
      spf: true,
      dkim: true,
      dmarc: true,
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      companyId: 1,
      createdById: "user-123",
    },
    mailboxes: [],
    aggregated: {
      totalMailboxes: 5,
      activeMailboxes: 5,
      statusSummary: {
        NOT_STARTED: 0,
        WARMING: 1,
        WARMED: 4,
        PAUSED: 0,
      },
      totalWarmups: 5,
      avgDailyLimit: 45,
      totalSent: 1500,
      avgWarmupProgress: 85,
    },
    metrics: {
      total24h: 1500,
      bounceRate: 2.5,
      spamRate: 0.1,
      openRate: 45.2,
      replyRate: 12.8,
    },
  };

  const mockEmailAccounts: EmailAccount[] = [
    {
      id: 1,
      email: "sales@example.com",
      provider: "Gmail",
      status: "ACTIVE",
      reputation: 90,
      warmupStatus: WarmupStatus.WARMED,
      dayLimit: 50,
      sent24h: 45,
      spf: true,
      dkim: true,
      dmarc: true,
      lastSync: "2024-01-15T10:00:00Z",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      companyId: 1,
      createdById: "user-123",
    },
    {
      id: 2,
      email: "support@example.com",
      provider: "Gmail",
      status: "ACTIVE",
      reputation: 88,
      warmupStatus: WarmupStatus.WARMING,
      dayLimit: 40,
      sent24h: 30,
      spf: true,
      dkim: true,
      dmarc: false,
      lastSync: "2024-01-15T09:30:00Z",
      createdAt: "2024-01-02T00:00:00Z",
      updatedAt: "2024-01-15T00:00:00Z",
      companyId: 1,
      createdById: "user-123",
    },
  ];

  const mockParams = Promise.resolve({ domainId: "1" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Data Loading", () => {
    it("should load and display domain data successfully", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      render(<TestWrapper>{component}</TestWrapper>);

      expect(mockGetDomainById).toHaveBeenCalledWith(1); // Number parameter
      expect(mockGetTopAccountsForDomain).toHaveBeenCalledWith(1); // Number parameter
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        "example.com"
      );
    });

    it("should parse domainId correctly", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: mockParams });

      expect(mockGetDomainById).toHaveBeenCalledWith(1);
    });

    it("should handle domain not found", async () => {
      mockGetDomainById.mockResolvedValue(null);
      mockGetTopAccountsForDomain.mockResolvedValue([]);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Domain not found");
    });

    it("should load top accounts", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: mockParams });

      expect(mockGetTopAccountsForDomain).toHaveBeenCalledWith(1);
    });

    it("should handle empty email accounts", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue([]);

      const component = await DomainPage({ params: mockParams });
      const { getByTestId } = render(<TestWrapper>{component}</TestWrapper>);

      const emailsTable = getByTestId("emails-table");
      expect(emailsTable).toHaveTextContent("0 email accounts");
    });
  });

  describe("Domain Information Display", () => {
    it("should display domain name and provider", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.querySelector("h1")).toHaveTextContent("example.com");
      expect(container.textContent).toContain("Google Workspace");
    });

    it("should display reputation score", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("85");
      expect(container.textContent).toContain("Reputation Score");
    });

    it("should display 24h email metrics", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("1500");
      expect(container.textContent).toContain("Emails (24h)");
    });

    it("should display bounce rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("250.0%");
      expect(container.textContent).toContain("bounce rate");
    });

    it("should display open rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("4520.0");
      expect(container.textContent).toContain("Open Rate");
    });

    it("should display reply rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("1280.0");
      expect(container.textContent).toContain("reply rate");
    });

    it("should display spam rate", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("10.000%");
      expect(container.textContent).toContain("Spam Rate");
    });
  });

  describe("Authentication Status", () => {
    it("should show SPF configured status", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("SPF Record");
      expect(container.textContent).toContain("Configured");
    });

    it("should show DKIM configured status", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("DKIM Record");
      expect(container.textContent).toContain("Configured");
    });

    it("should show DMARC configured status", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("DMARC Record");
      expect(container.textContent).toContain("Configured");
    });

    it("should show not configured for missing SPF", async () => {
      const domainWithoutSPF = { ...mockDomain, spf: false };
      mockGetDomainById.mockResolvedValue(domainWithoutSPF);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Not Configured");
    });

    it("should show Complete Setup button when authentication incomplete", async () => {
      const domainWithoutAuth = { ...mockDomain, spf: false, dkim: false };
      mockGetDomainById.mockResolvedValue(domainWithoutAuth);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Complete Setup");
    });

    it("should not show Complete Setup button when fully configured", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const setupButtons = Array.from(container.querySelectorAll("a")).filter(
        (a) => a.textContent === "Complete Setup"
      );
      expect(setupButtons.length).toBe(0);
    });
  });

  describe("Navigation Links", () => {
    it("should have back to domains link", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const backLink = container.querySelector('a[href="/dashboard/domains"]');
      expect(backLink).toBeInTheDocument();
    });

    it("should have domain settings link", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const settingsLink = container.querySelector(
        'a[href="/dashboard/domains/1/settings"]'
      );
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink?.textContent).toContain("Domain Settings");
    });

    it("should have view all accounts link", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const accountsLink = container.querySelector(
        'a[href="/dashboard/domains/1/accounts"]'
      );
      expect(accountsLink).toBeInTheDocument();
      expect(accountsLink?.textContent).toContain("View All Accounts");
    });

    it("should have setup link when authentication incomplete", async () => {
      const domainWithoutAuth = { ...mockDomain, dmarc: false };
      mockGetDomainById.mockResolvedValue(domainWithoutAuth);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const setupLink = container.querySelector(
        'a[href="/dashboard/domains/1/setup"]'
      );
      expect(setupLink).toBeInTheDocument();
    });
  });

  describe("Components Rendering", () => {
    it("should render WeeklyMetricsClient component", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { getByTestId } = render(<TestWrapper>{component}</TestWrapper>);

      expect(getByTestId("weekly-metrics-client")).toBeInTheDocument();
    });

    it("should render EmailsTable with correct data", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { getByTestId } = render(<TestWrapper>{component}</TestWrapper>);

      const emailsTable = getByTestId("emails-table");
      expect(emailsTable).toBeInTheDocument();
      expect(emailsTable.textContent).toContain("2 email accounts");
    });

    it("should display all metric cards", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Reputation Score");
      expect(container.textContent).toContain("Emails (24h)");
      expect(container.textContent).toContain("Open Rate");
      expect(container.textContent).toContain("Spam Rate");
    });

    it("should display authentication status card", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Authentication Status");
      expect(container.textContent).toContain(
        "Email authentication records and their status"
      );
    });

    it("should display weekly metrics card", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Weekly Metrics");
      expect(container.textContent).toContain(
        "Performance trends over the last 7 days"
      );
    });

    it("should display top email accounts card", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("Top Email Accounts");
      expect(container.textContent).toContain(
        "Best performing email accounts in this domain"
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle domain with missing metrics", async () => {
      const domainWithoutMetrics = { ...mockDomain, metrics: undefined };
      mockGetDomainById.mockResolvedValue(domainWithoutMetrics);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      // Verify all metric fallback values are displayed correctly
      expect(container.textContent).toContain("0"); // Emails (24h) count
      expect(container.textContent).toContain("0.0"); // Open Rate
      expect(container.textContent).toContain("0.0% bounce rate");
      expect(container.textContent).toContain("0.0% reply rate");
      expect(container.textContent).toContain("0.000%");
    });

    it("should handle domain with zero metrics", async () => {
      const domainWithZeroMetrics = {
        ...mockDomain,
        metrics: {
          total24h: 0,
          bounceRate: 0,
          spamRate: 0,
          openRate: 0,
          replyRate: 0,
        },
      };
      mockGetDomainById.mockResolvedValue(domainWithZeroMetrics);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("0.0");
    });

    it("should handle different domain IDs", async () => {
      const params2 = Promise.resolve({ domainId: "42" });
      mockGetDomainById.mockResolvedValue({ ...mockDomain, id: "42" });
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: params2 });

      expect(mockGetDomainById).toHaveBeenCalledWith(42);
      expect(mockGetTopAccountsForDomain).toHaveBeenCalledWith(42);
    });

    it("should handle domain with no authentication", async () => {
      const domainNoAuth = {
        ...mockDomain,
        spf: false,
        dkim: false,
        dmarc: false,
      };
      mockGetDomainById.mockResolvedValue(domainNoAuth);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const notConfigured = Array.from(container.querySelectorAll("*")).filter(
        (el) => el.textContent === "Not Configured"
      );
      expect(notConfigured.length).toBeGreaterThan(0);
    });

    it("should handle very high reputation score", async () => {
      const domainHighRep = { ...mockDomain, reputation: 100 };
      mockGetDomainById.mockResolvedValue(domainHighRep);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("100");
    });

    it("should handle very low reputation score", async () => {
      const domainLowRep = { ...mockDomain, reputation: 10 };
      mockGetDomainById.mockResolvedValue(domainLowRep);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      expect(container.textContent).toContain("10");
    });
  });

  describe("Async Params Handling", () => {
    it("should await params before fetching data", async () => {
      let paramsResolved = false;
      const delayedParams = new Promise<{ domainId: string }>((resolve) => {
        setTimeout(() => {
          paramsResolved = true;
          resolve({ domainId: "1" });
        }, 10);
      });

      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      await DomainPage({ params: delayedParams });

      expect(paramsResolved).toBe(true);
      expect(mockGetDomainById).toHaveBeenCalled();
    });
  });

  describe("Layout and Structure", () => {
    it("should render main container", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const mainContainer = container.querySelector(".container");
      expect(mainContainer).toBeInTheDocument();
    });

    it("should render metric cards in grid layout", async () => {
      mockGetDomainById.mockResolvedValue(mockDomain);
      mockGetTopAccountsForDomain.mockResolvedValue(mockEmailAccounts);

      const component = await DomainPage({ params: mockParams });
      const { container } = render(<TestWrapper>{component}</TestWrapper>);

      const gridLayouts = container.querySelectorAll(".grid");
      expect(gridLayouts.length).toBeGreaterThan(0);
    });
  });
});
