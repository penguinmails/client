import React from "react";
import { render, screen } from "@testing-library/react";
import QuickActions from "../QuickActions";

// Mock the useTranslations hook from next-intl
jest.mock("next-intl", () => ({
  useTranslations: (namespace) => {
    const messages = require("../../../../../../../messages/en.json");
    const namespaceMessages = messages[namespace] || {};
    return (key) => namespaceMessages[key] || key;
  },
}));

describe("QuickActions", () => {
  let container;

  beforeEach(() => {
    const { container: renderedContainer } = render(<QuickActions />);
    container = renderedContainer;
  });

  it("renders the component title", () => {
    expect(screen.getByText("Quick Actions")).toBeInTheDocument();
  });

  it("displays all action buttons", () => {
    expect(
      screen.getByRole("link", { name: /create campaign/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /upload leads/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /add domain/i })
    ).toBeInTheDocument();
  });

  it("has correct href for create campaign", () => {
    const createCampaignLink = screen.getByRole("link", {
      name: /create campaign/i,
    });
    expect(createCampaignLink).toHaveAttribute(
      "href",
      "/dashboard/campaigns/create"
    );
  });

  it("has correct href for upload leads", () => {
    const uploadLeadsLink = screen.getByRole("link", { name: /upload leads/i });
    expect(uploadLeadsLink).toHaveAttribute("href", "/dashboard/leads");
  });

  it("has correct href for add domain", () => {
    const addDomainLink = screen.getByRole("link", { name: /add domain/i });
    expect(addDomainLink).toHaveAttribute("href", "/dashboard/domains/new");
  });

  it("renders Plus icon for create campaign", () => {
    const blueIconContainer = container.querySelector(".bg-blue-100");
    expect(blueIconContainer).toBeInTheDocument();
  });

  it("renders Upload icon for upload leads", () => {
    const greenIconContainer = container.querySelector(".bg-green-100");
    expect(greenIconContainer).toBeInTheDocument();
  });

  it("renders Globe icon for add domain", () => {
    const purpleIconContainer = container.querySelector(".bg-purple-100");
    expect(purpleIconContainer).toBeInTheDocument();
  });

  it("has proper card structure", () => {
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toBeInTheDocument();
  });

  it("has separator between header and content", () => {
    const separator = container.querySelector(
      '[data-orientation="horizontal"]'
    );
    expect(separator).toBeInTheDocument();
  });

  it("applies consistent spacing between actions", () => {
    const content = container.querySelector(".space-y-3");
    expect(content).toBeInTheDocument();
  });

  it("uses ghost button variant", () => {
    const buttons = container.querySelectorAll("a");
    buttons.forEach((button) => {
      expect(button).toHaveClass("justify-start");
    });
  });

  it("has proper icon styling for each action", () => {
    const blueIcon = container.querySelector(".text-blue-600");
    const greenIcon = container.querySelector(".text-green-600");
    const purpleIcon = container.querySelector(".text-purple-600");
    expect(blueIcon).toBeInTheDocument();
    expect(greenIcon).toBeInTheDocument();
    expect(purpleIcon).toBeInTheDocument();
  });

  it("has responsive icon containers", () => {
    const iconContainers = container.querySelectorAll(
      '[class*="size-8"][class*="rounded-lg"]'
    );
    expect(iconContainers.length).toBe(3);
  });
});