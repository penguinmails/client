import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, LogIn, AlertOctagon } from "lucide-react";
import { useRouter } from "next/navigation";

export const SessionErrorView = ({ error }: { error: Error }) => {
  const router = useRouter();
  const isNetworkError = error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('timeout');
  
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle>{isNetworkError ? "Connection Issues" : "Session Invalid"}</AlertTitle>
        <AlertDescription>
          {isNetworkError 
            ? "We're having trouble connecting to the authentication service. Please check your internet connection."
            : "Your session has expired or is invalid. Please log in again."
          }
        </AlertDescription>
      </Alert>
      <Button 
        variant="outline" 
        onClick={() => isNetworkError ? window.location.reload() : router.push('/')}
        className="flex items-center gap-2"
      >
        {isNetworkError ? <RefreshCw className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        {isNetworkError ? "Retry Connection" : "Go to Login"}
      </Button>
    </div>
  );
};

export const EnrichmentErrorView = ({ error }: { error: Error }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertOctagon className="h-4 w-4" />
        <AlertTitle>Data Loading Error</AlertTitle>
        <AlertDescription>
          Unable to load your profile data. detailed error: {error.message}
        </AlertDescription>
      </Alert>
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Page
      </Button>
    </div>
  );
};
