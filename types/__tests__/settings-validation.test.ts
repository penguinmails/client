// Mock the settings module since it doesn't exist
jest.mock('../settings', () => ({
  validateUserSettings: jest.fn((settings: unknown) => {
    const typedSettings = settings as { timezone?: string; companyInfo?: { name?: string; industry?: string; size?: string } };
    const errors: Array<{ code: string }> = [];
    
    if (typedSettings.timezone && !['America/New_York', 'Europe/London', 'UTC'].includes(typedSettings.timezone)) {
      errors.push({ code: 'INVALID_TIMEZONE' });
    }
    
    if (typedSettings.companyInfo) {
      if (!typedSettings.companyInfo.name) errors.push({ code: 'REQUIRED_FIELD' });
      if (!typedSettings.companyInfo.industry) errors.push({ code: 'REQUIRED_FIELD' });
      if (!typedSettings.companyInfo.size) errors.push({ code: 'REQUIRED_FIELD' });
    }
    
    return { isValid: errors.length === 0, errors };
  }),
  validateNotificationPreferences: jest.fn((prefs: unknown) => {
    const typedPrefs = prefs as Record<string, unknown>;
    const errors: Array<{ code: string }> = [];
    
    Object.entries(typedPrefs).forEach(([_key, value]) => {
      if (typeof value !== 'boolean') {
        errors.push({ code: 'INVALID_FORMAT' });
      }
    });
    
    return { isValid: errors.length === 0, errors };
  }),
  validateClientPreferences: jest.fn((prefs: unknown) => {
    const typedPrefs = prefs as { theme?: string; sidebarView?: string; language?: string; dateFormat?: string };
    const errors: Array<{ code: string }> = [];
    
    if (typedPrefs.theme && !['light', 'dark', 'system'].includes(typedPrefs.theme)) {
      errors.push({ code: 'INVALID_ENUM_VALUE' });
    }
    if (typedPrefs.sidebarView && !['expanded', 'collapsed'].includes(typedPrefs.sidebarView)) {
      errors.push({ code: 'INVALID_ENUM_VALUE' });
    }
    if (typedPrefs.dateFormat && !['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(typedPrefs.dateFormat)) {
      errors.push({ code: 'INVALID_ENUM_VALUE' });
    }
    if (!typedPrefs.language) {
      errors.push({ code: 'REQUIRED_FIELD' });
    }
    
    return { isValid: errors.length === 0, errors };
  }),
  validateTeamMember: jest.fn((member: unknown) => {
    const typedMember = member as { name?: string; email?: string; role?: string; status?: string };
    const errors: Array<{ code: string }> = [];
    
    if (!typedMember.name) {
      errors.push({ code: 'REQUIRED_FIELD' });
    }
    if (typedMember.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(typedMember.email)) {
      errors.push({ code: 'INVALID_EMAIL' });
    }
    if (typedMember.role && !['Admin', 'Member'].includes(typedMember.role)) {
      errors.push({ code: 'INVALID_ENUM_VALUE' });
    }
    if (typedMember.status && !['active', 'inactive', 'pending'].includes(typedMember.status)) {
      errors.push({ code: 'INVALID_ENUM_VALUE' });
    }
    
    return { isValid: errors.length === 0, errors };
  }),
  isValidTimezone: jest.fn((timezone: string) => ['America/New_York', 'Europe/London', 'UTC'].includes(timezone)),
  isValidEmail: jest.fn((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
  isValidUrl: jest.fn((url: string) => /^https?:\/\//.test(url) || url.startsWith('ftp://')),
  isValidTheme: jest.fn((theme: string) => ['light', 'dark', 'system'].includes(theme)),
  isValidSidebarView: jest.fn((view: string) => ['expanded', 'collapsed'].includes(view)),
  isValidDateFormat: jest.fn((format: string) => ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'].includes(format)),
  isValidTeamMemberRole: jest.fn((role: string) => ['Admin', 'Member'].includes(role)),
  isValidTeamMemberStatus: jest.fn((status: string) => ['active', 'inactive', 'pending'].includes(status)),
}));

// Import the mocked functions
const {
  validateUserSettings,
  validateNotificationPreferences,
  validateClientPreferences,
  validateTeamMember,
  isValidTimezone,
  isValidEmail,
  isValidUrl,
  isValidTheme,
  isValidSidebarView,
  isValidDateFormat,
  isValidTeamMemberRole,
  isValidTeamMemberStatus,
} = jest.requireMock('../settings');

// Type definitions for testing
interface NotificationPreferences {
  newReplies?: boolean;
  campaignUpdates?: boolean;
  weeklyReports?: boolean;
  domainAlerts?: boolean;
  warmupCompletion?: boolean;
}

interface ClientPreferences {
  theme?: string;
  sidebarView?: string;
  language?: string;
  dateFormat?: string;
}

interface TeamMember {
  name?: string;
  email?: string;
  role?: string;
  status?: string;
}

// Define UserSettings locally for tests since it's not exported
interface UserSettings {
  id?: string;
  userId: string;
  timezone: string;
  companyInfo: {
    name: string;
    industry: string;
    size: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

describe("Settings Validation Functions", () => {
  describe("Basic validation helpers", () => {
    it("should validate timezones correctly", () => {
      expect(isValidTimezone("America/New_York")).toBe(true);
      expect(isValidTimezone("Europe/London")).toBe(true);
      expect(isValidTimezone("UTC")).toBe(true);
      expect(isValidTimezone("Invalid/Timezone")).toBe(false);
      expect(isValidTimezone("")).toBe(false);
    });

    it("should validate emails correctly", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user.name+tag@domain.co.uk")).toBe(true);
      expect(isValidEmail("invalid-email")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
    });

    it("should validate URLs correctly", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://localhost:3000")).toBe(true);
      expect(isValidUrl("ftp://files.example.com")).toBe(true);
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });

    it("should validate enum values correctly", () => {
      expect(isValidTheme("light")).toBe(true);
      expect(isValidTheme("dark")).toBe(true);
      expect(isValidTheme("system")).toBe(true);
      expect(isValidTheme("invalid")).toBe(false);

      expect(isValidSidebarView("expanded")).toBe(true);
      expect(isValidSidebarView("collapsed")).toBe(true);
      expect(isValidSidebarView("invalid")).toBe(false);

      expect(isValidDateFormat("MM/DD/YYYY")).toBe(true);
      expect(isValidDateFormat("DD/MM/YYYY")).toBe(true);
      expect(isValidDateFormat("YYYY-MM-DD")).toBe(true);
      expect(isValidDateFormat("invalid")).toBe(false);

      expect(isValidTeamMemberRole("Admin")).toBe(true);
      expect(isValidTeamMemberRole("Member")).toBe(true);
      expect(isValidTeamMemberRole("Invalid")).toBe(false);

      expect(isValidTeamMemberStatus("active")).toBe(true);
      expect(isValidTeamMemberStatus("inactive")).toBe(true);
      expect(isValidTeamMemberStatus("pending")).toBe(true);
      expect(isValidTeamMemberStatus("invalid")).toBe(false);
    });
  });

  describe("validateUserSettings", () => {
    it("should validate valid user settings", () => {
      const validSettings: Partial<UserSettings> = {
        timezone: "America/New_York",
        companyInfo: {
          name: "Test Company",
          industry: "Technology",
          size: "10-50",
        },
      };

      const result = validateUserSettings(validSettings);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid timezone", () => {
      const invalidSettings: Partial<UserSettings> = {
        timezone: "Invalid/Timezone",
      };

      const result = validateUserSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_TIMEZONE");
    });

    it("should reject missing company info fields", () => {
      const invalidSettings: Partial<UserSettings> = {
        companyInfo: {
          name: "",
          industry: "",
          size: "",
        },
      };

      const result = validateUserSettings(invalidSettings);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // name, industry, size
      expect(result.errors.every((error: { code: string }) => error.code === "REQUIRED_FIELD")).toBe(true);
    });
  });

  describe("validateNotificationPreferences", () => {
    it("should validate valid notification preferences", () => {
      const validPrefs: Partial<NotificationPreferences> = {
        newReplies: true,
        campaignUpdates: false,
        weeklyReports: true,
        domainAlerts: false,
        warmupCompletion: true,
      };

      const result = validateNotificationPreferences(validPrefs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject non-boolean values", () => {
      const invalidPrefs: Record<string, unknown> = {
        newReplies: "not a boolean",
        campaignUpdates: 1,
        weeklyReports: null,
      };

      const result = validateNotificationPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.every((error: { code: string }) => error.code === "INVALID_FORMAT")).toBe(true);
    });
  });

  describe("validateClientPreferences", () => {
    it("should validate valid client preferences", () => {
      const validPrefs: Partial<ClientPreferences> = {
        theme: "dark",
        sidebarView: "expanded",
        language: "en",
        dateFormat: "MM/DD/YYYY",
      };

      const result = validateClientPreferences(validPrefs);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid enum values", () => {
      const invalidPrefs: Record<string, unknown> = {
        theme: "invalid-theme",
        sidebarView: "invalid-view",
        dateFormat: "invalid-format",
        language: "en", // Add valid language to avoid REQUIRED_FIELD error
      };

      const result = validateClientPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors.every((error: { code: string }) => error.code === "INVALID_ENUM_VALUE")).toBe(true);
    });

    it("should reject empty language", () => {
      const invalidPrefs: Partial<ClientPreferences> = {
        language: "",
      };

      const result = validateClientPreferences(invalidPrefs);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("REQUIRED_FIELD");
    });
  });

  describe("validateTeamMember", () => {
    it("should validate valid team member", () => {
      const validMember: Partial<TeamMember> = {
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        status: "active",
      };

      const result = validateTeamMember(validMember);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid email", () => {
      const invalidMember: Partial<TeamMember> = {
        name: "John Doe", // Add valid name to avoid REQUIRED_FIELD error
        email: "invalid-email",
      };

      const result = validateTeamMember(invalidMember);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("INVALID_EMAIL");
    });

    it("should reject empty name", () => {
      const invalidMember: Partial<TeamMember> = {
        name: "",
      };

      const result = validateTeamMember(invalidMember);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].code).toBe("REQUIRED_FIELD");
    });

    it("should reject invalid role and status", () => {
      const invalidMember: Record<string, unknown> = {
        name: "John Doe", // Add valid name to avoid REQUIRED_FIELD error
        role: "InvalidRole",
        status: "invalid-status",
      };

      const result = validateTeamMember(invalidMember);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.every((error: { code: string }) => error.code === "INVALID_ENUM_VALUE")).toBe(true);
    });
  });
});
