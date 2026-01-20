/**
 * Team Feature - Public API
 * 
 * Provides centralized access to team management functionality following FSD architecture.
 * External features should only import from this index file, not from internal modules.
 */

// Actions - Server-side operations
export {
  getTeamMembers,
  inviteTeamMember,
  removeTeamMember,
  updateTeamMemberRole,
  getTeamInvites,
  cancelInvite,
  resendInvite,
} from './actions';

// Types - Public type definitions
export type {
  TeamMember,
  TeamRole,
  TeamPermission,
} from './types';

// UI Components - Public components for external use
export {
  TeamMembersTable,
} from './ui/components';