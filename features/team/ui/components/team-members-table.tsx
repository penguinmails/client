"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw, AlertCircle } from "lucide-react";
import {
  getTeamMembers,
  updateTeamMember,
  removeTeamMember,
  addTeamMember,
  resendInvite,
  cancelInvite,
} from "../integration/team-api";
import {
  useServerAction,
  useServerActionWithParams,
} from "@/hooks/use-server-action";
import type { TeamMember, TeamInvite, TeamRole } from "@features/team/types";
import { NextRequest } from "next/server";
import { UnifiedDataTable } from "@/components/design-system/unified-data-table";
import { EditMemberDialog } from "./dialogs/edit-member-dialog";
import { AddMemberDialog } from "./dialogs/add-member-dialog";
import { DeleteMemberDialog } from "./dialogs/delete-member-dialog";
import { createColumns, type TeamTableItem } from "./columns";

function TeamMembersTable() {
  const { toast } = useToast();
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [loadingIds, setLoadingIds] = useState<{ [key: string]: boolean }>({});

  // Server action hooks
  const teamMembersAction = useServerAction(() => getTeamMembers(), {
    onError: (error) => {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    },
  });

  const updateMemberAction = useServerActionWithParams(
    ({
      memberId,
      updates,
    }: {
      memberId: string;
      updates: { role?: TeamRole; status?: "active" | "inactive" };
    }) => updateTeamMember(memberId, updates),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team member updated successfully",
        });
        setEditingMember(null);
        teamMembersAction.execute(undefined);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const removeMemberAction = useServerActionWithParams(
    (memberId: string) => removeTeamMember(memberId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Team member removed successfully",
        });
        setDeletingMember(null);
        teamMembersAction.execute(undefined);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const addMemberAction = useServerActionWithParams(
    (data: {
      email: string;
      password: string;
      role: TeamRole;
      name?: string;
      givenName?: string;
      familyName?: string;
    }) =>
      addTeamMember({
        data: { email: data.email, role: data.role },
        req: undefined as unknown as NextRequest,
      }),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "User account created and added to team successfully",
        });
        setShowAddDialog(false);
        teamMembersAction.execute(undefined);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const resendInviteAction = useServerActionWithParams(
    (inviteId: string) => resendInvite(inviteId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Invitation resent successfully",
        });
        setLoadingIds((prev) => {
          const newIds = { ...prev };
          // Logic to clear specific ID would need ID passed through, simplistic here
          return newIds;
        });
        teamMembersAction.execute(undefined);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  const cancelInviteAction = useServerActionWithParams(
    (inviteId: string) => cancelInvite(inviteId),
    {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Invitation cancelled successfully",
        });
        teamMembersAction.execute(undefined);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error,
          variant: "destructive",
        });
      },
    }
  );

  // Load team members on mount
  useEffect(() => {
    teamMembersAction.execute(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
  };

  const handleDeleteMember = (member: TeamMember) => {
    setDeletingMember(member);
  };

  const handleSaveEdit = (
    memberId: string,
    updates: { role?: TeamRole; status?: "active" | "inactive" }
  ) => {
    updateMemberAction.execute({ memberId, updates });
  };

  const handleConfirmDelete = () => {
    if (deletingMember) {
      removeMemberAction.execute(deletingMember.id);
    }
  };

  const handleAddMember = (data: {
    email: string;
    password: string;
    role: TeamRole;
    name?: string;
    givenName?: string;
    familyName?: string;
  }) => {
    addMemberAction.execute(data);
  };

  const handleResendInvite = useCallback(async (invite: TeamInvite) => {
    setLoadingIds((prev) => ({ ...prev, [`resend-${invite.id}`]: true }));
    await resendInviteAction.execute(invite.id);
    setLoadingIds((prev) => ({ ...prev, [`resend-${invite.id}`]: false }));
  }, [resendInviteAction]);

  const handleCancelInvite = useCallback(async (invite: TeamInvite) => {
    setLoadingIds((prev) => ({ ...prev, [`cancel-${invite.id}`]: true }));
    await cancelInviteAction.execute(invite.id);
    setLoadingIds((prev) => ({ ...prev, [`cancel-${invite.id}`]: false }));
  }, [cancelInviteAction]);

  const columns = useMemo(
    () =>
      createColumns({
        onEdit: handleEditMember,
        onDelete: handleDeleteMember,
        onResendInvite: handleResendInvite,
        onCancelInvite: handleCancelInvite,
        loadingIds,
      }),
    [loadingIds, handleResendInvite, handleCancelInvite]
  );

  if (teamMembersAction.loading && !teamMembersAction.data) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (teamMembersAction.error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <h3 className="text-lg font-medium">Failed to load team members</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {typeof teamMembersAction.error === "string"
              ? teamMembersAction.error
              : "An error occurred"}
          </p>
        </div>
        <Button
          onClick={() => teamMembersAction.execute(undefined)}
          variant="outline"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  // Map server response to expected format
  const serverData = teamMembersAction.data || [];
  const members = Array.isArray(serverData)
    ? serverData.map((member: Partial<TeamMember>) => {
      const name = member.name
        ? `${member.name}`.trim()
        : member.email || "Unknown";
      return {
        id: member.id || "",
        userId: member.userId || "",
        teamId: member.teamId || "",
        email: member.email || "",
        name: name,
        role: member.role || "member",
        status: member.status || "active",
        avatar: member.avatar,
        joinedAt: member.joinedAt || new Date(),
        lastActiveAt: member.lastActiveAt,
        permissions: member.permissions || [],
        twoFactorEnabled: member.twoFactorEnabled,
        metadata: member.metadata,
      } as TeamMember;
    })
    : [];

  // TODO: Fetch invites properly when API supports it. For now assuming invites are not returned or handled differently
  const invites: (TeamInvite & { status: "pending"; name: string })[] = [];

  // Combine members and invites for the unified table
  const tableData: TeamTableItem[] = [...members, ...invites];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="text-sm text-muted-foreground">
            Manage your team members and their permissions
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      <UnifiedDataTable
        data={tableData}
        columns={columns}
        searchable={true}
        paginated={true}
        emptyMessage="No team members found"
      />

      {/* Edit Member Dialog */}
      <EditMemberDialog
        member={editingMember}
        open={!!editingMember}
        onOpenChange={(open) => !open && setEditingMember(null)}
        onSave={handleSaveEdit}
        loading={updateMemberAction.loading}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddMember}
        loading={addMemberAction.loading}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteMemberDialog
        member={deletingMember}
        open={!!deletingMember}
        onOpenChange={(open) => !open && setDeletingMember(null)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

export default TeamMembersTable;
