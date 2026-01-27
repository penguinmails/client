// Core type definitions - separated to avoid circular dependencies
// This file contains only the essential types that utility functions need

export interface CoreUser {
  id: string;
  tenantId: string;
  teamId?: string;
  email: string;
  displayName: string;
  claims: {
    role: string;
    tenantId: string;
    permissions: string[];
  };
  profile: {
    timezone: string;
    language: string;
  };
}

export interface CoreCompany {
  id: string;
  tenantId: string;
  name: string;
}

export interface CoreTeam {
  id: string;
  tenantId: string;
  name: string;
  ownerId: string;
  memberCount: number;
  settings: {
    allowMemberInvites: boolean;
    requireTwoFactorAuth: boolean;
    defaultRole: string;
    autoApproveMembers: boolean;
    notifyOnNewMember: boolean;
  };
}

export interface CoreTenant {
  id: string;
  name: string;
  created: string;
}

export enum CoreUserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum CoreTeamRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner'
}
