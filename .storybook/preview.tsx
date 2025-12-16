import type { Preview } from "@storybook/nextjs";
import nextIntl from "./next-intl";
import "@/app/[locale]/globals.css";
import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Import messages for NextIntl
import en from "../messages/en.json";
import es from "../messages/es.json";

// Mock providers for Storybook to avoid server-side dependencies
const MockAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div data-testid="mock-auth-provider">{children}</div>;
};

const MockSidebarProvider: React.FC<{
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ children, defaultOpen = true }) => {
  return (
    <div data-testid="mock-sidebar-provider" data-default-open={defaultOpen}>
      {children}
    </div>
  );
};

const MockAnalyticsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div data-testid="mock-analytics-provider">{children}</div>;
};

const messagesByLocale: Record<string, any> = { en, es };

const preview: Preview = {
  initialGlobals: {
    locale: "en",
    locales: {
      en: "English",
      es: "Español",
    },
  },
  decorators: [
    (Story, context) => {
      const locale = context.globals.locale || "en";
      const messages = messagesByLocale[locale] || messagesByLocale.en;

      return (
        <QueryClientProvider client={new QueryClient()}>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <MockAuthProvider>
              <MockSidebarProvider defaultOpen={true}>
                <MockAnalyticsProvider>
                  <Story />
                </MockAnalyticsProvider>
              </MockSidebarProvider>
            </MockAuthProvider>
          </NextIntlClientProvider>
        </QueryClientProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true, // IMPORTANTE para Next 13/14/15 con next/navigation
      navigation: {
        pathname: "/dashboard",
        query: {},
      },
    },
    nextIntl,
  },
};

export default preview;
