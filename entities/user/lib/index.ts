import { CoreUser as User, CoreUserRole } from '../index';
export function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).tenantId === 'string' &&
    typeof (obj as User).email === 'string' &&
    typeof (obj as User).displayName === 'string' &&
    typeof (obj as User).claims === 'object' &&
    typeof (obj as User).profile === 'object'
  );
}

export function getUserDisplayName(user: User): string {
  return user.displayName || user.email.split('@')[0];
}

export function getUserInitials(user: User): string {
  const name = getUserDisplayName(user);
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function isUserAdmin(user: User): boolean {
  return user.claims.role === CoreUserRole.ADMIN || user.claims.role === CoreUserRole.SUPER_ADMIN;
}

export function isUserSuperAdmin(user: User): boolean {
  return user.claims.role === CoreUserRole.SUPER_ADMIN;
}
export function canUserAccessTenant(user: User, tenantId: string): boolean {
  return user.tenantId === tenantId;
}
export function createDefaultUser(partial: Partial<User>): User {
  return {
    id: partial.id || '',
    tenantId: partial.tenantId || '',
    email: partial.email || '',
    displayName: partial.displayName || '',
    claims: partial.claims || {
      role: CoreUserRole.USER,
      tenantId: partial.tenantId || '',
      permissions: [],
    },
    profile: partial.profile || {
      timezone: 'UTC',
      language: 'en',
    },
    ...partial,
  };
}
