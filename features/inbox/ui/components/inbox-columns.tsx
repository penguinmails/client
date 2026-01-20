"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Client, Email } from "@features/inbox/types";
import { Campaign } from "@features/campaigns/types";
import { AuthUser } from "@features/auth/types";
import { Button } from "@/components/ui/button/button";
import { toast } from "sonner";
import { InboxColumnAction } from "./inbox-column-action";
import { showCustomToast } from "@/components/ui/custom/custom-toast";
import { redirect } from "next/navigation";

// Local action to avoid upward dependency
const markEmailAsStarredMutarion = async (id: number, starred: boolean, _user: AuthUser | null) => {
  try {
    // TODO: Implement proper API call when inbox actions are created
    // For now, just show success toast
    showCustomToast({
      title: "Email marked as " + (starred ? "starred" : "unstarred"),
      description: "The email has been successfully updated.",
      icon: starred ? (
        <span className="text-yellow-500">⭐</span>
      ) : (
        <span className="text-gray-400">☆</span>
      ),
    });
  } catch (error) {
    toast.warning(
      "Error marking email as starred: " +
      (error instanceof Error ? error.message : "Unknown error")
    );
    throw error;
  }
};

export const inboxColumns = (
  refetch: () => void,
  _user: AuthUser | null
): ColumnDef<Email>[] => [
    {
      accessorKey: "starred",
      header: "Starred",
      cell: ({ row }) => {
        const isStarred = row.getValue("starred");
        return (
          <Button
            onClick={async () => {
              await markEmailAsStarredMutarion(row.original.id, !isStarred, _user);
              refetch();
            }}
            variant="ghost"
            className="p-0"
          >
            <div className="flex items-center justify-center">
              {isStarred ? (
                <span className="text-yellow-500">⭐</span>
              ) : (
                <span className="text-gray-400 text-2xl">☆</span>
              )}
            </div>
          </Button>
        );
      },
    },
    {
      accessorKey: "client",
      header: "From",
      cell: ({ row }) => {
        const from: Client = row.getValue("client");
        return (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={() => redirect(`/dashboard/inbox/${row.original.id}`)}
          >
            <span>{from?.name || from?.email || "Unknown"}</span>
          </div>

        );
      },
    },
    {
      accessorKey: "client",
      header: "Email",
      cell: ({ row }) => {
        const from: string = row.original.client?.email || "";

        return (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={() => redirect(`/dashboard/inbox/${row.original.id}`)}
          >
            <span>{from}</span>
          </div>
        );
      },
    },
    {
      header: "Subject",
      cell: ({ row }) => {
        const subject: string = row.original.subject;
        return (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={() => redirect(`/dashboard/inbox/${row.original.id}`)}
          >
            <span>{subject.slice(0, 10)}...</span>
          </div>
        );
      },
    },
    {
      header: "Preview",
      cell: ({ row }) => {
        const body: string = row.original.body;

        return (
          <div
            className="flex items-center justify-center cursor-pointer"
            onClick={() => redirect(`/dashboard/inbox/${row.original.id}`)}
          >
            <span>{body.slice(0, 10)}...</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return (
          <span>
            {date.toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => {
        const campaign: Campaign = row.getValue("campaign");
        return (
          <div className="flex items-center justify-center">
            <span>{campaign.name}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "id",
      header: "Actions",
      cell: ({ row }) => {
        return <InboxColumnAction row={row} refetch={refetch} key={row.id} />;
      },
    },
  ];
