"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { cn } from "@/lib/utils";
import { Edit, Trash2, RefreshCw } from "lucide-react";
import type { TeamMember, TeamInvite, TeamRole } from "@features/team/types";

// Helper for initials
const getInitials = (name: string) => {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
};

const formatLastActive = (lastActiveAt?: Date) => {
    if (!lastActiveAt) return "Never";

    const now = new Date();
    const diffMs = now.getTime() - lastActiveAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return lastActiveAt.toLocaleDateString();
};

const getRoleBadgeColor = (role: TeamRole) => {
    switch (role) {
        case "owner":
            return "bg-red-100 text-red-700 border-red-300";
        case "admin":
            return "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-500/30";
        case "member":
            return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30";
        case "viewer":
            return "bg-muted dark:bg-muted/60 text-foreground border-border";
        default:
            return "bg-muted dark:bg-muted/60 text-foreground border-border";
    }
};

const getStatusBadgeColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/30";
        case "inactive":
            return "bg-muted dark:bg-muted/60 text-foreground border-border";
        case "pending":
            return "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-500/30";
        default:
            return "bg-muted dark:bg-muted/60 text-foreground border-border";
    }
};

export type TeamTableItem = TeamMember | (TeamInvite & { status: "pending"; name: string });

interface CreateColumnsProps {
    onEdit: (member: TeamMember) => void;
    onDelete: (member: TeamMember) => void;
    onResendInvite: (invite: TeamInvite) => void;
    onCancelInvite: (invite: TeamInvite) => void;
    loadingIds: { [key: string]: boolean };
}

export const createColumns = ({
    onEdit,
    onDelete,
    onResendInvite,
    onCancelInvite,
    loadingIds,
}: CreateColumnsProps): ColumnDef<TeamTableItem>[] => [
        {
            accessorKey: "name",
            header: "Member",
            cell: ({ row }) => {
                const item = row.original;
                return (
                    <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-muted text-muted-foreground">
                                {getInitials(item.name || item.email)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h4
                                className={cn(
                                    "font-medium",
                                    item.status === "pending" && "text-muted-foreground"
                                )}
                            >
                                {item.name || item.email}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {item.status === "pending" ? "Invitation pending" : item.email}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const role = row.getValue("role") as TeamRole;
                return (
                    <Badge
                        variant="outline"
                        className={cn("font-medium", getRoleBadgeColor(role))}
                    >
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return (
                    <Badge
                        variant="outline"
                        className={cn("font-medium", getStatusBadgeColor(status))}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "lastActiveAt",
            header: "Last Active",
            cell: ({ row }) => {
                const item = row.original;
                if (item.status === "pending") {
                    const invite = item as TeamInvite;
                    return (
                        <span className="text-sm text-muted-foreground">
                            Invited {new Date(invite.invitedAt).toLocaleDateString()}
                        </span>
                    );
                }
                const member = item as TeamMember;
                return (
                    <span className="text-sm text-muted-foreground">
                        {formatLastActive(member.lastActiveAt)}
                    </span>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const item = row.original;

                if (item.status === "pending") {
                    const invite = item as TeamInvite;
                    const isResending = loadingIds[`resend-${invite.id}`];
                    const isCancelling = loadingIds[`cancel-${invite.id}`];

                    return (
                        <div className="flex items-center justify-end space-x-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => onResendInvite(invite)}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                ) : (
                                    "Resend"
                                )}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => onCancelInvite(invite)}
                                disabled={isCancelling}
                            >
                                Cancel
                            </Button>
                        </div>
                    );
                }

                const member = item as TeamMember;
                return (
                    <div className="flex items-center justify-end space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            onClick={() => onEdit(member)}
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => onDelete(member)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];
