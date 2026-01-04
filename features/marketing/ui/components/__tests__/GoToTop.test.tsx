import { screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { setupUIComponentTest } from "@/lib/test-utils/setup-helpers";
import GoToTopButton from "../GoToTop";

describe("GoToTopButton", () => {
  const { render: renderWithProviders } = setupUIComponentTest(GoToTopButton);
  let scrollToSpy: jest.SpyInstance;

  beforeEach(() => {
    scrollToSpy = jest.spyOn(window, "scrollTo").mockImplementation();
    Object.defineProperty(window, "scrollY", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    scrollToSpy.mockRestore();
  });

  it("renders the button", () => {
    renderWithProviders();

    const button = screen.getByRole("button", { name: /go to top/i });
    expect(button).toBeInTheDocument();
  });

  it("is initially hidden when page is at top", () => {
    renderWithProviders();

    const button = screen.getByRole("button");
    // Test for the actual CSS classes used in the component
    expect(button).toHaveClass("opacity-0", "pointer-events-none");
  });

  it("becomes visible when scrolled down past threshold", () => {
    renderWithProviders();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    // Test for the actual CSS classes used in the component
    expect(button).toHaveClass("opacity-100");
    expect(button).not.toHaveClass("pointer-events-none");
  });

  it("remains hidden when scrolled less than threshold", () => {
    renderWithProviders();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 300, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    expect(button).toHaveClass("opacity-0", "pointer-events-none");
  });

  it("scrolls to top when clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders();

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    const button = screen.getByRole("button");
    await user.click(button);

    expect(scrollToSpy).toHaveBeenCalledWith({
      top: 0,
      behavior: "smooth",
    });
  });

  it("has proper positioning and styling", () => {
    const { container } = renderWithProviders();

    const button = container.querySelector("button");
    expect(button).toHaveAttribute("data-slot", "button");
    
    // Test for semantic positioning classes instead of specific ones
    expect(button).toHaveClass("fixed");
    expect(button).toHaveClass("rounded-full");
    expect(button).toHaveClass("z-50");
  });

  it("renders ArrowUp icon", () => {
    const { container } = renderWithProviders();

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("handles pointer events correctly based on visibility", () => {
    renderWithProviders();

    const button = screen.getByRole("button");
    
    // When hidden, should have pointer-events-none
    expect(button).toHaveClass("pointer-events-none");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 500, writable: true });
      fireEvent.scroll(window);
    });

    // When visible, should not have pointer-events-none
    expect(button).not.toHaveClass("pointer-events-none");
  });

  it("cleans up scroll event listener on unmount", () => {
    const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");
    const { unmount } = renderWithProviders();

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function)
    );
    removeEventListenerSpy.mockRestore();
  });

  it("is keyboard accessible", () => {
    renderWithProviders();
    
    const button = screen.getByRole("button");
    button.focus();
    expect(button).toHaveFocus();
  });

  it("has proper ARIA attributes", () => {
    renderWithProviders();
    
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Go to top");
  });
});