import { renderHook, act } from "@testing-library/react";
import { useSessionTimeout } from "../use-session-timeout";
import { useAuth } from "@/features/auth/hooks/use-auth";

// Mocks
jest.mock("@/features/auth/hooks/use-auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  productionLogger: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe("useSessionTimeout", () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    (useAuth as jest.Mock).mockReturnValue({
      user: { id: "1", email: "test@test.com" },
      logout: mockLogout,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does nothing if disabled or no user", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      logout: mockLogout,
    });

    const { result } = renderHook(() => useSessionTimeout({ enabled: true }));
    
    // Fast forward time
    act(() => {
      jest.advanceTimersByTime(1000000);
    });

    expect(mockLogout).not.toHaveBeenCalled();
  });

  it("warns before timeout", () => {
    const timeoutMs = 1000;
    const warningMs = 400;
    const onWarning = jest.fn();

    const { result } = renderHook(() => 
      useSessionTimeout({ timeoutMs, warningMs, onWarning })
    );

    expect(result.current.isWarning).toBe(false);

    // Advance to warning time (1000 - 400 = 600ms)
    act(() => {
      jest.advanceTimersByTime(650);
    });

    expect(result.current.isWarning).toBe(true);
    expect(onWarning).toHaveBeenCalledWith(warningMs);
  });

  it("logs out after timeout", () => {
    const timeoutMs = 1000;
    const onTimeout = jest.fn();

    renderHook(() => 
      useSessionTimeout({ timeoutMs, warningMs: 200, onTimeout })
    );

    act(() => {
      jest.advanceTimersByTime(1100);
    });

    expect(mockLogout).toHaveBeenCalled();
    expect(onTimeout).toHaveBeenCalled();
  });

  it("resets timer on activity", () => {
    const timeoutMs = 1000;
    const { result } = renderHook(() => 
      useSessionTimeout({ timeoutMs, warningMs: 200 })
    );

    // Provide activity method via result for testing logic (simulating the event listener effect)
    // Note: In real hook we use window listeners. We can simulate via resetTimer directly.
    
    // Advance halfway
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Reset
    act(() => {
      result.current.resetTimer();
    });

    // Advance past original timeout (500 + 600 = 1100 > 1000)
    // But since we reset at 500, we should have another 1000ms (timeout at 1500)
    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockLogout).not.toHaveBeenCalled();

    // Advance to new timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockLogout).toHaveBeenCalled();
  });
});
