"use client";

import { Button } from "@/components/ui/button/button";
import { RefreshCw, Settings } from "lucide-react";

interface ConversationsListHeaderProps {
  title?: string;
  count?: number;
}

export default function ConversationsListHeader({
  title = "All Conversations",
  count = 0
}: ConversationsListHeaderProps) {
  return (
    <div className="p-2 border-b border-gray-200 dark:border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-foreground">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({count})
          </span>
        </h2>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
