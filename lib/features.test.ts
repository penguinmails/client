
import { isFeatureEnabled } from "./features";

describe("isFeatureEnabled", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("returns true when feature is present in env var", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "turnstile,other";
    expect(isFeatureEnabled("turnstile")).toBe(true);
  });

  it("returns false when feature is not present", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "other-feature";
    expect(isFeatureEnabled("turnstile")).toBe(false);
  });

  it("returns false when env var is empty", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = "";
    expect(isFeatureEnabled("turnstile")).toBe(false);
  });

  it("returns false when env var is undefined", () => {
    delete process.env.NEXT_PUBLIC_FEATURE_FLAGS;
    expect(isFeatureEnabled("turnstile")).toBe(false);
  });

  it("handles whitespace correctly", () => {
    process.env.NEXT_PUBLIC_FEATURE_FLAGS = " turnstile , other ";
    expect(isFeatureEnabled("turnstile")).toBe(true);
  });
});
