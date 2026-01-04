import { screen } from "@testing-library/react";
import { setupUIComponentTest } from "@/lib/test-utils/setup-helpers";
import { Header } from "../header";

// Mock the copy text
jest.mock("../data/copy", () => ({
  copyText: {
    page: {
      title: "Clients Management",
    },
  },
}));

describe("Header", () => {
  const { render: renderWithProviders } = setupUIComponentTest(Header);

  it("renders the header", () => {
    renderWithProviders();
    expect(screen.getByRole("heading")).toBeInTheDocument();
  });

  it("displays the page title from copy text", () => {
    renderWithProviders();
    expect(screen.getByText("Clients Management")).toBeInTheDocument();
  });

  it("renders heading with proper semantic structure", () => {
    renderWithProviders();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("Clients Management");
  });

  it("has proper layout structure with accessible content", () => {
    const { container } = renderWithProviders();
    const wrapper = container.firstChild;
    
    // Test that the header is rendered and contains the expected content
    expect(wrapper).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText("Clients Management")).toBeInTheDocument();
  });
});