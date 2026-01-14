import { CoreTeam as Team } from "../index";
export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "invited" | "disabled" | "inactive" | "pending";
  joinedAt?: string;
  lastActive?: string;
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

export enum CoreTeamRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  OWNER = 'owner'
}

export function isValidTeamMemberRole(role: string): boolean {
  const validRoles = ["Admin", "Member"];
  return validRoles.includes(role);
}

export function isValidTeamMemberStatus(status: string): boolean {
  const validStatuses = ["active", "inactive", "pending"];
  return validStatuses.includes(status);
}

export function filterTeamsByTenant(teams: Team[], tenantId: string): Team[] {
  return teams.filter(team => team.tenantId === tenantId);
}
