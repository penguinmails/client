import type { TeamMember } from "../../types/settings";

// Extended Team Member Type with additional fields
export interface ExtendedTeamMember extends TeamMember {
  joinedDate: string;
  department?: string;
  permissions: TeamPermission[];
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneNumber?: string;
  location?: string;
  bio?: string;
}

// Team Role Types
export interface TeamRole {
  id: string;
  name: TeamMember["role"];
  description: string;
  permissions: TeamPermission[];
  level: number; // For hierarchy
  color: string; // For UI display
}

// Permission Types
export interface TeamPermission {
  id: string;
  name: string;
  category: "campaigns" | "domains" | "billing" | "team" | "settings" | "analytics";
  description: string;
}

// Team Activity Types
export interface TeamActivity {
  id: string;
  memberId: number;
  memberName: string;
  action: string;
  target?: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

// Team Invitation Types
export interface TeamInvitation {
  id: string;
  email: string;
  role: TeamMember["role"];
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  token?: string;
}

// Permission definitions
export const permissions: Record<string, TeamPermission> = {
  // Campaign permissions
  viewCampaigns: {
    id: "perm-1",
    name: "View Campaigns",
    category: "campaigns",
    description: "Can view all campaigns and their details",
  },
  createCampaigns: {
    id: "perm-2",
    name: "Create Campaigns",
    category: "campaigns",
    description: "Can create new email campaigns",
  },
  editCampaigns: {
    id: "perm-3",
    name: "Edit Campaigns",
    category: "campaigns",
    description: "Can edit existing campaigns",
  },
  deleteCampaigns: {
    id: "perm-4",
    name: "Delete Campaigns",
    category: "campaigns",
    description: "Can delete campaigns",
  },
  
  // Domain permissions
  viewDomains: {
    id: "perm-5",
    name: "View Domains",
    category: "domains",
    description: "Can view domain configurations",
  },
  manageDomains: {
    id: "perm-6",
    name: "Manage Domains",
    category: "domains",
    description: "Can add, edit, and remove domains",
  },
  
  // Billing permissions
  viewBilling: {
    id: "perm-7",
    name: "View Billing",
    category: "billing",
    description: "Can view billing information and invoices",
  },
  manageBilling: {
    id: "perm-8",
    name: "Manage Billing",
    category: "billing",
    description: "Can update payment methods and subscription plans",
  },
  
  // Team permissions
  viewTeam: {
    id: "perm-9",
    name: "View Team",
    category: "team",
    description: "Can view team members and their roles",
  },
  manageTeam: {
    id: "perm-10",
    name: "Manage Team",
    category: "team",
    description: "Can invite, edit, and remove team members",
  },
  
  // Settings permissions
  viewSettings: {
    id: "perm-11",
    name: "View Settings",
    category: "settings",
    description: "Can view application settings",
  },
  manageSettings: {
    id: "perm-12",
    name: "Manage Settings",
    category: "settings",
    description: "Can modify application settings",
  },
  
  // Analytics permissions
  viewAnalytics: {
    id: "perm-13",
    name: "View Analytics",
    category: "analytics",
    description: "Can view analytics and reports",
  },
  exportAnalytics: {
    id: "perm-14",
    name: "Export Analytics",
    category: "analytics",
    description: "Can export analytics data",
  },
};

// Role definitions
export const roles: TeamRole[] = [
  {
    id: "role-admin",
    name: "Admin",
    description: "Full access to all features and settings",
    level: 4,
    color: "#DC2626", // red
    permissions: Object.values(permissions), // All permissions
  },
  {
    id: "role-manager",
    name: "Outreach Manager",
    description: "Can manage campaigns and view analytics",
    level: 3,
    color: "#2563EB", // blue
    permissions: [
      permissions.viewCampaigns,
      permissions.createCampaigns,
      permissions.editCampaigns,
      permissions.deleteCampaigns,
      permissions.viewDomains,
      permissions.viewTeam,
      permissions.viewAnalytics,
      permissions.exportAnalytics,
      permissions.viewSettings,
    ],
  },
  {
    id: "role-analyst",
    name: "Analyst",
    description: "Can view campaigns and analytics",
    level: 2,
    color: "#7C3AED", // purple
    permissions: [
      permissions.viewCampaigns,
      permissions.viewDomains,
      permissions.viewTeam,
      permissions.viewAnalytics,
      permissions.exportAnalytics,
    ],
  },
  {
    id: "role-member",
    name: "Member",
    description: "Basic access to view campaigns",
    level: 1,
    color: "#059669", // green
    permissions: [
      permissions.viewCampaigns,
      permissions.viewTeam,
    ],
  },
];

// Mock team members
export const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@acmecorp.com",
    role: "Admin",
    status: "active",
    lastActive: "2024-12-20T15:30:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JD",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.com",
    role: "Outreach Manager",
    status: "active",
    lastActive: "2024-12-20T14:20:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SJ",
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@acmecorp.com",
    role: "Analyst",
    status: "active",
    lastActive: "2024-12-20T10:15:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MC",
  },
  {
    id: 4,
    name: "Emily Davis",
    email: "emily.davis@acmecorp.com",
    role: "Member",
    status: "active",
    lastActive: "2024-12-19T16:45:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ED",
  },
  {
    id: 5,
    name: "Robert Wilson",
    email: "robert.wilson@acmecorp.com",
    role: "Outreach Manager",
    status: "inactive",
    lastActive: "2024-12-10T09:00:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=RW",
  },
  {
    id: 6,
    name: "Jessica Martinez",
    email: "jessica.martinez@acmecorp.com",
    role: "Member",
    status: "invited",
    lastActive: "",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JM",
  },
];

// Extended mock team members with additional details
export const mockExtendedTeamMembers: ExtendedTeamMember[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@acmecorp.com",
    role: "Admin",
    status: "active",
    lastActive: "2024-12-20T15:30:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=JD",
    joinedDate: "2023-01-15",
    department: "Management",
    permissions: Object.values(permissions),
    twoFactorEnabled: true,
    emailVerified: true,
    phoneNumber: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    bio: "Founder and CEO of Acme Corporation",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah.johnson@acmecorp.com",
    role: "Outreach Manager",
    status: "active",
    lastActive: "2024-12-20T14:20:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=SJ",
    joinedDate: "2023-03-20",
    department: "Marketing",
    permissions: roles.find(r => r.name === "Outreach Manager")?.permissions || [],
    twoFactorEnabled: true,
    emailVerified: true,
    phoneNumber: "+1 (555) 234-5678",
    location: "New York, NY",
    bio: "Leading outreach campaigns and email marketing strategies",
  },
  {
    id: 3,
    name: "Michael Chen",
    email: "michael.chen@acmecorp.com",
    role: "Analyst",
    status: "active",
    lastActive: "2024-12-20T10:15:00Z",
    avatar: "https://api.dicebear.com/7.x/initials/svg?seed=MC",
    joinedDate: "2023-06-10",
    department: "Analytics",
    permissions: roles.find(r => r.name === "Analyst")?.permissions || [],
    twoFactorEnabled: false,
    emailVerified: true,
    phoneNumber: "+1 (555) 345-6789",
    location: "Seattle, WA",
    bio: "Data analyst focusing on campaign performance metrics",
  },
];

// Mock team activities
export const mockTeamActivities: TeamActivity[] = [
  {
    id: "activity-1",
    memberId: 1,
    memberName: "John Doe",
    action: "Created campaign",
    target: "Black Friday Sale 2024",
    timestamp: "2024-12-20T15:30:00Z",
    details: "Created new email campaign targeting 5,000 contacts",
    ipAddress: "192.168.1.100",
  },
  {
    id: "activity-2",
    memberId: 2,
    memberName: "Sarah Johnson",
    action: "Updated domain settings",
    target: "mail.acmecorp.com",
    timestamp: "2024-12-20T14:20:00Z",
    details: "Updated SPF and DKIM records",
    ipAddress: "192.168.1.101",
  },
  {
    id: "activity-3",
    memberId: 3,
    memberName: "Michael Chen",
    action: "Exported analytics",
    target: "Q4 2024 Report",
    timestamp: "2024-12-20T10:15:00Z",
    details: "Exported campaign performance data for Q4 2024",
    ipAddress: "192.168.1.102",
  },
  {
    id: "activity-4",
    memberId: 1,
    memberName: "John Doe",
    action: "Invited team member",
    target: "jessica.martinez@acmecorp.com",
    timestamp: "2024-12-19T16:45:00Z",
    details: "Sent invitation to join as Member",
    ipAddress: "192.168.1.100",
  },
  {
    id: "activity-5",
    memberId: 2,
    memberName: "Sarah Johnson",
    action: "Paused campaign",
    target: "Holiday Newsletter",
    timestamp: "2024-12-19T12:00:00Z",
    details: "Paused campaign due to content updates",
    ipAddress: "192.168.1.101",
  },
];

// Mock team invitations
export const mockTeamInvitations: TeamInvitation[] = [
  {
    id: "invite-1",
    email: "jessica.martinez@acmecorp.com",
    role: "Member",
    invitedBy: "john.doe@acmecorp.com",
    invitedAt: "2024-12-19T16:45:00Z",
    expiresAt: "2024-12-26T16:45:00Z",
    status: "pending",
    token: "invite_token_abc123",
  },
  {
    id: "invite-2",
    email: "david.brown@acmecorp.com",
    role: "Analyst",
    invitedBy: "john.doe@acmecorp.com",
    invitedAt: "2024-12-15T10:00:00Z",
    expiresAt: "2024-12-22T10:00:00Z",
    status: "expired",
  },
  {
    id: "invite-3",
    email: "lisa.anderson@acmecorp.com",
    role: "Outreach Manager",
    invitedBy: "sarah.johnson@acmecorp.com",
    invitedAt: "2024-12-10T14:30:00Z",
    expiresAt: "2024-12-17T14:30:00Z",
    status: "accepted",
  },
];

// Helper functions
export function getRoleByName(roleName: TeamMember["role"]): TeamRole | undefined {
  return roles.find(role => role.name === roleName);
}

export function getPermissionsForRole(roleName: TeamMember["role"]): TeamPermission[] {
  const role = getRoleByName(roleName);
  return role?.permissions || [];
}

export function hasPermission(
  member: TeamMember | ExtendedTeamMember,
  permissionId: string
): boolean {
  const rolePermissions = getPermissionsForRole(member.role);
  return rolePermissions.some(p => p.id === permissionId);
}

export function getActiveTeamMembers(): TeamMember[] {
  return mockTeamMembers.filter(member => member.status === "active");
}

export function getTeamMemberById(id: number): TeamMember | undefined {
  return mockTeamMembers.find(member => member.id === id);
}

export function formatLastActive(lastActive: string): string {
  if (!lastActive) return "Never";
  
  const date = new Date(lastActive);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  
  return date.toLocaleDateString();
}

// Team statistics
export const teamStatistics = {
  totalMembers: mockTeamMembers.length,
  activeMembers: mockTeamMembers.filter(m => m.status === "active").length,
  pendingInvitations: mockTeamMembers.filter(m => m.status === "invited").length,
  rolesDistribution: {
    Admin: mockTeamMembers.filter(m => m.role === "Admin").length,
    "Outreach Manager": mockTeamMembers.filter(m => m.role === "Outreach Manager").length,
    Analyst: mockTeamMembers.filter(m => m.role === "Analyst").length,
    Member: mockTeamMembers.filter(m => m.role === "Member").length,
  },
};
