import { TeamMember } from '@features/team/types';


export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    userId: 'user-1',
    teamId: 'team-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    joinedAt: new Date(),
    lastActiveAt: new Date(),
    permissions: ['all']
  },
  {
    id: '2',
    userId: 'user-2',
    teamId: 'team-1',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'member',
    status: 'active',
    joinedAt: new Date(Date.now() - 86400000),
    lastActiveAt: new Date(Date.now() - 3600000),
    permissions: ['campaigns:read', 'campaigns:write']
  }
];

export const mockNileUser = {
  id: '1',
  email: 'john.doe@example.com',
  displayName: 'John Doe',
  tenantId: 'tenant-1',
  claims: {
    role: 'admin',
    tenantId: 'tenant-1',
    companyId: 'company-1'
  },
  profile: {
    firstName: 'John',
    lastName: 'Doe'
  }
};