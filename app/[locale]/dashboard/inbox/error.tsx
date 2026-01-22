"use client";

import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function InboxError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-foreground">
      <div className="rounded-tl-2xl overflow-hidden flex flex-col dark:bg-muted/50 dark:divide-border">
        {/* Smart Insights Placeholder */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-blue-50 dark:from-blue-500/10 to-purple-50 dark:to-purple-500/10">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Smart Insights
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-1 opacity-50">
                <div className="flex items-center space-x-3 p-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
                  <div>
                    <p className="text-sm font-bold text-gray-400">-</p>
                    <h3 className="text-sm font-medium text-gray-400">Loading...</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filter Placeholder */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1 mb-6 opacity-50">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Button
                key={i}
                variant="ghost"
                className="w-full justify-between h-auto py-2.5 px-3"
                disabled
              >
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
                <span className="text-xs">-</span>
              </Button>
            ))}
          </div>

          <div className="mt-6 space-y-4 opacity-50">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filter By
            </h3>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4" />
                  <span className="text-sm font-medium">Loading...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      <div className="col-span-2 dark:bg-card flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-xl font-semibold">
              Failed to Load Conversations
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>
              We encountered an error while fetching your conversations. This
              might be due to a temporary issue with the server.
            </p>
            <p className="text-sm mt-2">
              Error details: {error.message}
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button
              onClick={reset}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
