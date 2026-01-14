import { CoreTeam as Team, CoreTeamRole } from '../index';
import { CoreUser as User } from '../../user';

export function isTeam(obj: unknown): obj is Team {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Team).id === 'string' &&
    typeof (obj as Team).tenantId === 'string' &&
    typeof (obj as Team).name === 'string' &&
    typeof (obj as Team).ownerId === 'string' &&
    typeof (obj as Team).memberCount === 'number' &&
    typeof (obj as Team).settings === 'object'
  );
}
export function canUserAccessTeam(user: User, team: Team): boolean {
  return user.tenantId === team.tenantId && (user.teamId === team.id || user.id === team.ownerId);
}

export function createDefaultTeam(partial: Partial<Team>): Team {
  return {
    id: partial.id || '',
    tenantId: partial.tenantId || '',
    name: partial.name || '',
    ownerId: partial.ownerId || '',
    memberCount: partial.memberCount || 0,
    settings: partial.settings || {
      allowMemberInvites: true,
      requireTwoFactorAuth: false,
      defaultRole: 'member' as CoreTeamRole,
      autoApproveMembers: true,
      notifyOnNewMember: false,
    },
    ...partial,
  };
}
