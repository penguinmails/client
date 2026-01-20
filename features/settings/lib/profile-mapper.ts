// Profile mapping interfaces
export interface NileUser {
  id: string;
  email: string;
  name?: string;
  familyName?: string;
  givenName?: string;
  picture?: string;
  created: string;
  updated?: string;
  emailVerified?: boolean;
  tenants: string[];
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  avatarUrl: string;
  timezone: string;
  language: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  sidebarView?: "collapsed" | "expanded";
}

// Mapping functions
export const mapNileUserToFormData = (user: NileUser): ProfileFormData => ({
  firstName: user.givenName || "",
  lastName: user.familyName || "",
  name: user.name || "",
  email: user.email,
  avatarUrl: user.picture || "",
  timezone: "UTC", // Default timezone
  language: "en", // Default language
  phone: undefined, // Not available in NileUser
  bio: undefined, // Not available in NileUser
  avatar: user.picture || "",
  sidebarView: undefined, // Not available in NileUser
});

export const mapFormDataToNileUpdate = (formData: Partial<ProfileFormData>) => {
  const result: Record<string, string | undefined> = {};

  if (formData.name !== undefined)
    result.name = formData.name.trim() || undefined;
  if (formData.firstName !== undefined)
    result.givenName = formData.firstName.trim() || undefined;
  if (formData.lastName !== undefined)
    result.familyName = formData.lastName.trim() || undefined;
  if (formData.avatarUrl !== undefined)
    result.picture = formData.avatarUrl.trim() || undefined;

  return result;
};

// Validation function
export const validateProfileUpdateData = (data: {
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}) => {
  const errors: string[] = [];

  if (
    data.name !== undefined &&
    data.name !== "" &&
    typeof data.name !== "string"
  ) {
    errors.push("Name must be a string");
  }
  if (
    data.givenName !== undefined &&
    data.givenName !== "" &&
    typeof data.givenName !== "string"
  ) {
    errors.push("First name must be a string");
  }
  if (
    data.familyName !== undefined &&
    data.familyName !== "" &&
    typeof data.familyName !== "string"
  ) {
    errors.push("Last name must be a string");
  }
  if (
    data.picture !== undefined &&
    data.picture !== "" &&
    typeof data.picture !== "string"
  ) {
    errors.push("Picture must be a string");
  }

  return { isValid: errors.length === 0, errors };
};
