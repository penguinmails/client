"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DatabaseErrorPageProps {
    onRetry: () => void;
    error?: Error;
}

/**
 * Fallback page shown when DB enrichment fails after retries
 */
export const DatabaseErrorPage: React.FC<DatabaseErrorPageProps> = ({
    onRetry,
    error
}) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            <h1 className="text-2xl font-bold mb-2 tracking-tight">
                Could not load your workspace
            </h1>

            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                We&apos;re having trouble reaching the database to load your details.
                You are still logged in, but we can&apos;t show your data right now.
                {error && (
                    <span className="block mt-2 text-xs font-mono opacity-50">
                        Error: {error.message}
                    </span>
                )}
            </p>

            <div className="flex gap-4">
                <Button onClick={onRetry} className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Reload Page
                </Button>
            </div>

            <p className="mt-8 text-xs text-muted-foreground/60 italic">
                The session is active, so your progress is safe.
            </p>
        </div>
    );
};
