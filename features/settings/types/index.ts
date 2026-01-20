// ============================================================================
// SETTINGS TYPES - MODULAR EXPORTS
// ============================================================================

// Base types and utilities
export * from "./base";

// Domain-specific types
export * from "./user";
export * from "./billing";
export { type SecuritySettings } from "./security";

export * from "./notifications";
export * from "./team";
export * from "./appearance";
export * from "./tracking";
export * from "./settings";


// Navigation and UI
export * from "./navigation";

// Utilities
export * from "./guards";
export * from "./validation";

// Consolidated types (for backward compatibility)
export * from "./consolidated";
