import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Providers } from "../providers";

// Mock dependencies
jest.mock("@features/settings/ui/context/client-preferences-context", () => ({
  ClientPreferencesProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="preferences-provider">{children}</div>
  ),
}));

jest.mock("@/shared/context/system-health-context", () => ({
  SystemHealthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="system-health-provider">{children}</div>
  ),
}));


describe("Providers", () => {
  it("renders children", () => {
    render(
      <Providers>
        <div data-testid="child">Test Child</div>
      </Providers>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("wraps children with SystemHealthProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId("system-health-provider")).toBeInTheDocument();
  });

  it("wraps children with ClientPreferencesProvider", () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId("preferences-provider")).toBeInTheDocument();
  });

  it("renders all providers in correct nesting order", () => {
    render(
      <Providers>
        <div data-testid="content">Content</div>
      </Providers>
    );

    // Verify the nesting structure
    const systemHealthProvider = screen.getByTestId("system-health-provider");
    const preferencesProvider = screen.getByTestId("preferences-provider");

    expect(systemHealthProvider).toContainElement(preferencesProvider);
    expect(preferencesProvider).toContainElement(screen.getByTestId("content"));
  });

  it("handles multiple children", () => {
    render(
      <Providers>
        <div data-testid="child1">Child 1</div>
        <div data-testid="child2">Child 2</div>
      </Providers>
    );

    expect(screen.getByTestId("child1")).toBeInTheDocument();
    expect(screen.getByTestId("child2")).toBeInTheDocument();
  });
});