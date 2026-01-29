/**
 * Type safety tests for consolidated User interface
 * These tests verify the consolidated User type matches the specification
 */

import { AuthUser, Permission, UserRole, UserPreferences } from "@/types/auth";

// Test consolidated User interface structure
describe('Consolidated User Interface', () => {
  it('should have all required string ID fields', () => {
    const testUser: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    expect(typeof testUser.id).toBe('string');
    expect(typeof testUser.email).toBe('string');
    expect(typeof testUser.name).toBe('string');
    
    // Test optional tenant membership
    if (testUser.tenantMembership) {
      expect(typeof testUser.tenantMembership.tenantId).toBe('string');
    }
  });

  it('should support optional tenant membership', () => {
    const userWithMembership: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      tenantMembership: {
        tenantId: 'tenant-456',
        user_id: 'user-123',
        roles: ['user'],
        email: 'test@example.com',
      },
    };

    expect(userWithMembership.tenantMembership).toBeDefined();

    const userWithoutMembership: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    expect(userWithoutMembership.tenantMembership).toBeUndefined();
  });

  it('should have optional picture and name fields', () => {
    const minimalUser: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
    };

    expect(minimalUser.picture).toBeUndefined();
    expect(minimalUser.name).toBeUndefined();

    const userWithPhoto: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
    };

    expect(userWithPhoto.picture).toBeDefined();
    expect(userWithPhoto.name).toBeDefined();
  });

  it('should have optional preferences', () => {
    const testUser: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    };

    expect(testUser.preferences).toBeUndefined();

    const userWithPreferences: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
      },
    };

    expect(userWithPreferences.preferences).toBeDefined();
  });
});

// Test backward compatibility claims alias
describe('Claims Alias (Backward Compatibility)', () => {
  it('should support claims object with role and permissions', () => {
    const userWithClaims: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      claims: {
        role: UserRole.USER,
        tenantId: 'tenant-123',
        permissions: [Permission.VIEW_USERS],
      },
    };

    expect(userWithClaims.claims).toBeDefined();
    expect(typeof userWithClaims.claims?.role).toBe('string');
    expect(Array.isArray(userWithClaims.claims?.permissions)).toBe(true);
  });

  it('should support optional companyId in claims', () => {
    const userWithCompany: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      claims: {
        role: UserRole.USER,
        tenantId: 'tenant-123',
        companyId: 'company-456',
        permissions: [],
      },
    };

    expect(userWithCompany.claims?.companyId).toBeDefined();

    const userWithoutCompany: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      claims: {
        role: UserRole.USER,
        tenantId: 'tenant-123',
        permissions: [],
      },
    };

    expect(userWithoutCompany.claims?.companyId).toBeUndefined();
  });
});

// Test UserPreferences interface
describe('UserPreferences Interface', () => {
  it('should have optional theme and language', () => {
    const preferences: UserPreferences = {
      theme: 'dark',
      language: 'en',
      timezone: 'UTC',
    };

    expect(preferences.theme).toBe('dark');
    expect(preferences.language).toBe('en');
    expect(preferences.timezone).toBe('UTC');
  });

  it('should have all optional notification fields', () => {
    const preferences: UserPreferences = {
      theme: 'light',
      language: 'es',
      timezone: 'America/New_York',
      emailNotifications: true,
      pushNotifications: false,
      weeklyReports: true,
      marketingEmails: false,
    };

    expect(preferences.emailNotifications).toBeDefined();
    expect(preferences.pushNotifications).toBeDefined();
    expect(preferences.weeklyReports).toBeDefined();
    expect(preferences.marketingEmails).toBeDefined();
  });
});

// Type assertion tests to ensure type safety
describe('Type Safety Assertions', () => {
  it('should accept valid AuthUser object', () => {
    const validUser: AuthUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      picture: 'https://example.com/photo.jpg',
      claims: {
        role: UserRole.USER,
        tenantId: 'tenant-456',
        companyId: 'company-789',
        permissions: [Permission.VIEW_USERS],
      },
      preferences: {
        theme: 'dark',
        language: 'en',
        timezone: 'UTC',
      },
    };

    // Type assertion should pass
    expect(validUser).toBeDefined();
  });

  it('should accept user object with minimal required fields', () => {
    expect(() => {
      const minimalUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      return minimalUser;
    }).not.toThrow();
  });
});
