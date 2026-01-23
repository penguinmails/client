import type { Meta, StoryObj } from "@storybook/react";
import { UnifiedDataTable } from "@/components/design-system";
import { createColumns, type TeamTableItem } from "./columns";
import type { TeamMember, TeamInvite, TeamPermission } from "@features/team/types";

/**
 * This story showcases the Team Members Table using UnifiedDataTable
 * from the Design System.
 */
const meta: Meta<typeof UnifiedDataTable> = {
  title: "Settings/TeamMembersTable",
  component: UnifiedDataTable,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UnifiedDataTable<TeamTableItem>>;

// Mock data for stories
const mockMembers: TeamMember[] = [
  {
    id: "1",
    userId: "user-1",
    teamId: "team-1",
    email: "john.doe@example.com",
    name: "John Doe",
    role: "owner",
    status: "active",
    joinedAt: new Date("2024-01-15"),
    lastActiveAt: new Date(),
    permissions: ["all"] as TeamPermission[],
    twoFactorEnabled: true,
  },
  {
    id: "2",
    userId: "user-2",
    teamId: "team-1",
    email: "jane.smith@example.com",
    name: "Jane Smith",
    role: "admin",
    status: "active",
    joinedAt: new Date("2024-02-20"),
    lastActiveAt: new Date(Date.now() - 3600000),
    permissions: ["members:read", "members:write", "settings:read"] as TeamPermission[],
    twoFactorEnabled: false,
  },
  {
    id: "3",
    userId: "user-3",
    teamId: "team-1",
    email: "bob.wilson@example.com",
    name: "Bob Wilson",
    role: "member",
    status: "active",
    joinedAt: new Date("2024-03-10"),
    lastActiveAt: new Date(Date.now() - 86400000),
    permissions: ["campaigns:read", "campaigns:write"] as TeamPermission[],
    twoFactorEnabled: false,
  },
  {
    id: "4",
    userId: "user-4",
    teamId: "team-1",
    email: "alice.johnson@example.com",
    name: "Alice Johnson",
    role: "viewer",
    status: "inactive",
    joinedAt: new Date("2024-04-05"),
    permissions: ["campaigns:read", "domains:read"] as TeamPermission[],
    twoFactorEnabled: false,
  },
];

const mockInvites: (TeamInvite & { status: "pending"; name: string })[] = [
  {
    id: "inv-1",
    email: "pending.user@example.com",
    name: "pending.user@example.com",
    role: "member",
    status: "pending",
    invitedAt: new Date("2024-06-01"),
    expiresAt: new Date("2024-06-08"),
    invitedBy: "user-1",
    teamId: "team-1",
  },
];

// Create noop handlers for stories
const noopHandlers = {
  onEdit: () => {},
  onDelete: () => {},
  onResendInvite: () => {},
  onCancelInvite: () => {},
  loadingIds: {},
};

const columns = createColumns(noopHandlers);

/**
 * Default state with team members
 */
export const Default: Story = {
  args: {
    data: mockMembers,
    columns: columns,
    searchable: true,
    paginated: true,
    emptyMessage: "No team members found",
  },
};

/**
 * Table with pending invites
 */
export const WithPendingInvites: Story = {
  args: {
    data: [...mockMembers, ...mockInvites],
    columns: columns,
    searchable: true,
    paginated: true,
    emptyMessage: "No team members found",
  },
};

/**
 * Empty state when no team members exist
 */
export const Empty: Story = {
  args: {
    data: [],
    columns: columns,
    searchable: true,
    paginated: true,
    emptyMessage: "No team members found. Add your first team member to get started.",
  },
};

/**
 * Table with many members (pagination demo)
 */
export const ManyMembers: Story = {
  args: {
    data: [
      ...mockMembers,
      ...Array.from({ length: 15 }, (_, i): TeamMember => ({
        id: `${i + 5}`,
        userId: `user-${i + 5}`,
        teamId: "team-1",
        email: `user${i + 5}@example.com`,
        name: `Team Member ${i + 5}`,
        role: i % 2 === 0 ? "member" : "viewer",
        status: "active",
        joinedAt: new Date(),
        permissions: ["campaigns:read"] as TeamPermission[],
        twoFactorEnabled: false,
      })),
    ],
    columns: columns,
    searchable: true,
    paginated: true,
    emptyMessage: "No team members found",
  },
};
