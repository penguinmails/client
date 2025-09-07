/**
 * Clean unit tests for teamActions.ts
 * Focus on core functionality with proper type safety
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import type { TeamMember, TeamInvite } from '@/types/team';
import * as teamActions from '../teamActions';
import * as authUtils from '../../utils/auth';
import { TextEncoder } from 'util';

// Core exports from teamActions
const {
  getTeamMembers,
  addTeamMember,
  updateTeamMember,
  removeTeamMember,
  mockTeamMembers,
  mockInvites,
} = teamActions;

// Mock the auth module
jest.mock('../../utils/auth', () => ({
  getCurrentUserId: jest.fn(),
  requireUserId: jest.fn(),
  hasPermission: jest.fn(),
  checkRateLimit: jest.fn(),
}));

// Mock the team actions module to access mock data
jest.mock('../teamActions', () => {
  const originalModule = jest.requireActual('../teamActions') as Record<string, unknown>;
  return {
    ...originalModule,
    mockTeamMembers: (originalModule as { mockTeamMembers: TeamMember[] }).mockTeamMembers,
    mockInvites: (originalModule as { mockInvites: TeamInvite[] }).mockInvites,
  };
});

describe('Team Server Actions', () => {
  let originalMockTeamMembers: TeamMember[];
  let originalMockInvites: TeamInvite[];

  beforeEach(async () => {
    jest.clearAllMocks();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    globalThis.TextEncoder = TextEncoder;
    // Store original mock data
    originalMockTeamMembers = mockTeamMembers.map(member => ({
      ...member,
      joinedAt: new Date(member.joinedAt),
      lastActiveAt: member.lastActiveAt ? new Date(member.lastActiveAt) : undefined,
    }));
    originalMockInvites = mockInvites.map(invite => ({
      ...invite,
      invitedAt: new Date(invite.invitedAt),
      expiresAt: new Date(invite.expiresAt),
    }));
  });

  afterEach(async () => {
    // Restore original mock data
    mockTeamMembers.length = 0;
    mockTeamMembers.push(...originalMockTeamMembers);
    mockInvites.length = 0;
    mockInvites.push(...originalMockInvites);
  });

  describe('getTeamMembers', () => {
    it('should return team members for authenticated user', async () => {
      jest.spyOn(authUtils, 'getCurrentUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const getTeamResult = await getTeamMembers(true);

      expect(getTeamResult.success).toBe(true);
      if (getTeamResult.success) {
        expect(Array.isArray(getTeamResult.data.members)).toBe(true);
        expect(getTeamResult.data.members.length).toBeGreaterThan(0);
      }
    });
  });

  describe('addTeamMember', () => {
    it('should add team member successfully', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const newMember = {
        email: 'newmember@example.com',
        role: 'member' as const,
        name: 'New Member',
        sendInvite: true,
      };

      const addTeamResult = await addTeamMember(newMember);

      expect(addTeamResult.success).toBe(true);
      if (addTeamResult.success) {
        expect(addTeamResult.data).toBeDefined();
        if ('email' in addTeamResult.data) {
          expect(addTeamResult.data.email).toBe(newMember.email);
        }
      }
    });

    it('should validate email format', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const addTeamResult = await addTeamMember({
        email: 'invalid-email',
        role: 'member',
        sendInvite: true,
      });

      expect(addTeamResult.success).toBe(false);
    });
  });

  describe('updateTeamMember', () => {
    it('should update team member successfully', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const updateData = {
        role: 'admin' as const,
        status: 'active' as const,
      };

      const updateTeamResult = await updateTeamMember('member-3', updateData);

      expect(updateTeamResult.success).toBe(true);
    });
  });

  describe('removeTeamMember', () => {
    it('should remove team member successfully', async () => {
      jest.spyOn(authUtils, 'requireUserId').mockResolvedValue('user-123');
      jest.spyOn(authUtils, 'checkRateLimit').mockResolvedValue(true);

      const removeTeamResult = await removeTeamMember('member-3');

      expect(removeTeamResult.success).toBe(true);
      if (removeTeamResult.success) {
        expect(removeTeamResult.data.removed).toBe(true);
      }
    });
  });
});
