"use client";

import { useState } from "react";
import { RegularUser, PiiRevealResponse } from "@/features/admin/types";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AdminUserTableProps {
  users: RegularUser[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

interface RevealedData {
  [userId: string]: {
    email: string;
    name: string;
    givenName: string | null;
    familyName: string | null;
  };
}

export function AdminUserTable({
  users,
  loading,
  hasMore,
  onLoadMore,
}: AdminUserTableProps) {
  const [revealedData, setRevealedData] = useState<RevealedData>({});
  const [revealingUser, setRevealingUser] = useState<string | null>(null);

  const handleReveal = async (user: RegularUser) => {
    // If already revealed, just toggle visibility
    if (revealedData[user.id]) {
      const newRevealedData = { ...revealedData };
      delete newRevealedData[user.id];
      setRevealedData(newRevealedData);
      return;
    }

    try {
      setRevealingUser(user.id);

      const response = await fetch(`/api/admin/users/${user.id}/reveal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "Customer support investigation",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to reveal user data: ${response.status}`
        );
      }

      const data: PiiRevealResponse = await response.json();

      setRevealedData((prev) => ({
        ...prev,
        [user.id]: {
          email: data.user.email,
          name: data.user.name,
          givenName: data.user.givenName,
          familyName: data.user.familyName,
        },
      }));

      toast.success("User data revealed", {
        description: `Access logged for audit purposes`,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reveal user data"
      );
    } finally {
      setRevealingUser(null);
    }
  };

  const getDisplayData = (user: RegularUser) => {
    const revealed = revealedData[user.id];
    if (revealed) {
      return {
        email: revealed.email,
        name: revealed.name,
        isRevealed: true,
      };
    }
    return {
      email: user.email,
      name: user.name,
      isRevealed: false,
    };
  };

  return (
    <div className="bg-white dark:bg-card shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-border">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-foreground">
          Users
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-muted-foreground">
          Cross-tenant user list with privacy protection
        </p>
      </div>

      <ul className="divide-y divide-gray-200 dark:divide-border">
        {users.map((user) => {
          const display = getDisplayData(user);
          const isRevealing = revealingUser === user.id;
          const showRevealButton = user.piiMasked && !display.isRevealed;
          const showHideButton = display.isRevealed;

          return (
            <li key={user.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-foreground">
                        {(display.name && display.name.charAt(0).toUpperCase()) ||
                          "?"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-foreground flex items-center gap-2">
                      {display.name}
                      {(showRevealButton || showHideButton) && (
                        <button
                          onClick={() => handleReveal(user)}
                          disabled={isRevealing}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                          title={
                            showHideButton
                              ? "Hide user data"
                              : "Reveal user data (logged for audit)"
                          }
                        >
                          {isRevealing ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : showHideButton ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Reveal
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-muted-foreground flex items-center gap-2">
                      {display.email}
                      {display.isRevealed && (
                        <span className="text-xs text-green-600 font-medium">
                          (revealed)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isPenguinMailsStaff
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 dark:bg-muted text-gray-800 dark:text-foreground"
                      }`}
                  >
                    {user.isPenguinMailsStaff ? "Staff" : user.role}
                  </span>
                  <div className="text-xs text-gray-500 dark:text-muted-foreground">
                    {user.tenantCount} tenants • {user.companyCount} companies
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200 dark:border-border">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Loading...
              </>
            ) : (
              "Load More Users"
            )}
          </button>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="px-4 py-8 sm:px-6 text-center">
          <p className="text-gray-500 dark:text-muted-foreground">
            No users found.
          </p>
        </div>
      )}
    </div>
  );
}
