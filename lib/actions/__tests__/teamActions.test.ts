/**
 * Tests for team management server actions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { 
  getTeamMembers, 
  addTeamMember, 
  updateTeamMember, 
  removeTeamMember 
} from '../teamActions';

// Mock the auth utilities
jest.mock('../../utils/auth', () => ({
  getCurrentUserId: jest.fn().mockResolvedValue('test-user-1'),
  requireUserId: jest.fn().mockResolvedValue('test-user-1'),
  checkRateLimit: jest.fn().mockResolvedValue(true),
}));

// Mock the team constants
jest.mock('../../constants/team', () => ({
  TEAM_ERROR_CODES: {
    AUTH_REQUIRED: 'TEAM_AUTH_REQUIRED',
    PERMISSION_DENIED: 'TEAM_PERMISSION_DENIED',
    MEMBER_NOT_FOUND: 'TEAM_MEMBER_NOT_FOUND',
    MEMBER_EXISTS: 'TEAM_MEMBER_EXISTS',
    INVITE_EXISTS: 'TEAM_INVITE_EXISTS',
    TEAM_LIMIT_REACHED: 'TEAM_LIMIT_REACHED',
    RATE_LIMIT_EXCEEDED: 'TEAM_RATE_LIMIT_EXCEEDED',
    VALIDATION_FAILED: 'TEAM_VALIDATION_FAILED',
    UPDATE_FAILED: 'TEAM_UPDATE_FAILED',
  },
  ROLE_HIERARCHY: {
    owner: 3,
    admin: 2,
    member: 1,
    viewer: 0,
  },
  ROLE_PERMISSIONS: {
    owner: ['all'],
    admin: ['members:read', 'members:write', 'settings:read', 'settings:write'],
    member: ['members:read', 'settings:read'],
    viewer: ['members:read'],
  },
}));

describe('Team Actions', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('getTeamMembers', () => {
    it('should return team members successfully', async () => {
      const result = await getTeamMembers();
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.members).toBeDefined();
        expect(Array.isArray(result.data.members)).toBe(true);
        expect(result.data.stats).toBeDefined();
      }
    });

    it('should include invites when requested', async () => {
      const result = await getTeamMembers(true);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.invites).toBeDefined();
        expect(Array.isArray(result.data.invites)).toBe(true);
      }
    });
  });

  describe('addTeamMember', () => {
    it('should add a team member successfully', async () => {
      const memberData = {
        email: 'newmember@example.com',
        role: 'member' as const,
        sendInvite: true,
      };

      const result = await addTeamMember(memberData);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe(memberData.email);
        expect(result.data.role).toBe(memberData.role);
      }
    });

    it('should validate email format', async () => {
      const memberData = {
        email: 'invalid-email',
        role: 'member' as const,
        sendInvite: true,
      };

      const result = await addTeamMember(memberData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid email');
      }
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member successfully', async () => {
      const updates = {
        role: 'admin' as const,
        status: 'active' as const,
      };

      const result = await updateTeamMember('member-2', updates);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe(updates.role);
        expect(result.data.status).toBe(updates.status);
      }
    });

    it('should handle non-existent member', async () => {
      const updates = {
        role: 'admin' as const,
      };

      const result = await updateTeamMember('non-existent', updates);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('TEAM_MEMBER_NOT_FOUND');
      }
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      const result = await removeTeamMember('member-3');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.removed).toBe(true);
      }
    });

    it('should handle non-existent member', async () => {
      const result = await removeTeamMember('non-existent');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.code).toBe('TEAM_MEMBER_NOT_FOUND');
      }
    });
  });
});
