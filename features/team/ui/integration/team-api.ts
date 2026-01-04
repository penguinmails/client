import {
  getTeamMembers as getTeamMembersAction,
  getTeamInvites as getTeamInvitesAction,
  inviteTeamMember as inviteTeamMemberAction,
  updateTeamMemberRole as updateTeamMemberRoleAction,
  updateTeamMember as updateTeamMemberAction,
  removeTeamMember as removeTeamMemberAction,
  resendInvite as resendInviteAction,
  cancelInvite as cancelInviteAction,
} from "../../actions";

// Re-export actions for client consumption
export const getTeamMembers = getTeamMembersAction;
export const getTeamInvites = getTeamInvitesAction;
export const inviteTeamMember = inviteTeamMemberAction;
export const updateTeamMemberRole = updateTeamMemberRoleAction;
export const updateTeamMember = updateTeamMemberAction;
export const removeTeamMember = removeTeamMemberAction;
export const resendInvite = resendInviteAction;
export const cancelInvite = cancelInviteAction;
export const addTeamMember = inviteTeamMemberAction;
