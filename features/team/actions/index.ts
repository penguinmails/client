'use server';

import { NextRequest } from 'next/server';
import { TeamMember, TeamInvite } from '../types';
import { ActionResult } from '@/shared/types/api';

// Mock data
const mockMembers: TeamMember[] = [
  {
    id: '1',
    userId: 'user-1',
    teamId: 'team-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-01'),
    permissions: ['all']
  }
];

export async function getTeamMembers(_invites?: boolean): Promise<ActionResult<TeamMember[]>> {
  return {
    success: true,
    data: mockMembers
  };
}

export async function getTeamInvites(): Promise<ActionResult<TeamInvite[]>> {
  return {
    success: true,
    data: []
  };
}

export async function inviteTeamMember(_params: { data: { email: string; role: string }; req?: NextRequest }): Promise<ActionResult<void>> {
  return { success: true, data: undefined as unknown as void };
}

export async function addTeamMember(params: { data: { email: string; role: string }; req?: NextRequest }): Promise<ActionResult<void>> {
  return inviteTeamMember(params);
}

export async function updateTeamMemberRole(_memberId: string, _role: string): Promise<ActionResult<void>> {
  return { success: true, data: undefined as unknown as void };
}

export async function updateTeamMember(_memberId: string, _updates: Record<string, unknown>): Promise<ActionResult<void>> {
  return { success: true, data: undefined as unknown as void };
}

export async function removeTeamMember(_memberId: string): Promise<ActionResult<void>> {
  return { success: true, data: undefined as unknown as void };
}

export async function resendInvite(_inviteId: string): Promise<ActionResult<void>> {
  return { success: true, data: undefined as unknown as void };
}

export async function cancelInvite(_inviteId: string): Promise<ActionResult<void>> {
  return { success: true, data: undefined as unknown as void };
}
