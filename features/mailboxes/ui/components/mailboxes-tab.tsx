import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Plus, AlertCircle, Trash2, Settings } from "lucide-react";
import Link from "next/link";
import { MailboxWarmupData } from "@/types";
import { mapRawToLegacyMailboxData } from "@features/analytics/lib/mappers";
import MailboxesFilter from "./MailboxesFilter";
import { formatDistanceToNow } from "date-fns";

// ... type definitions
type LocalProgressiveAnalyticsState = Record<
  string,
  {
    data: ReturnType<typeof mapRawToLegacyMailboxData> | null;
    loading: boolean;
    error: string | null;
  }
>;

interface MailboxesTabProps {
  mailboxes: MailboxWarmupData[];
  analyticsState: LocalProgressiveAnalyticsState;
  loading: boolean;
  error: string | null;
}

function MailboxesTab({
  mailboxes,
  analyticsState,
  loading,
  error,
}: MailboxesTabProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                All Mailboxes
              </h2>
              <Badge className="bg-primary/20 text-primary">Loading...</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Loading mailboxes...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center space-x-2">
              <Mail className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                All Mailboxes
              </h2>
              <Badge className="bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400">
                Error
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border rounded-xl bg-card shadow-sm">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
           <h2 className="text-lg font-semibold text-foreground">All Mailboxes</h2>
           <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-md font-medium h-9 px-4 text-sm shadow-sm">
              <Link href="/dashboard/mailboxes/new" className="flex items-center gap-2">
                 <Plus className="w-4 h-4" /> Add Mailbox
              </Link>
           </Button>
        </div>

        <MailboxesFilter />
      </div>
      <div className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-muted">
              <TableRow>
                <TableHead>Mailbox</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Limit</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mailboxes.map((mailbox) => {
                const analytics = analyticsState[mailbox.id];
                return (
                  <TableRow
                    key={mailbox.id}
                    className="hover:bg-gray-50 dark:hover:bg-muted/30 transition-colors group"
                  >
                    <TableCell className="px-8 py-6">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-foreground cursor-pointer hover:text-blue-600 transition-colors text-lg">
                          {mailbox.email}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Date Created :{" "}
                          {Intl.DateTimeFormat("en-US").format(
                            new Date(mailbox.createdAt || "")
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Domain:{" "}
                          {mailbox.domain || mailbox.email.split("@")[1]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <Badge
                        variant={
                          mailbox.status === "active"
                            ? "default"
                            : mailbox.status === "warming"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                             mailbox.status === "active" ? "bg-green-100 text-green-700 hover:bg-green-100" : 
                             mailbox.status === "paused" ? "bg-red-100 text-red-700 hover:bg-red-100" : ""
                        }
                      >
                        {mailbox.status.charAt(0).toUpperCase() + mailbox.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                          {mailbox.dailyVolume}/day
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Daily sending limit
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-foreground">
                            {(
                              analytics?.data?.[0]?.totalWarmups || 0
                            ).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            total sent
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-sm text-gray-500">
                      {analytics?.data?.[0]?.lastUpdated
                        ? formatDistanceToNow(new Date(analytics.data[0].lastUpdated), { addSuffix: true }).replace("about ", "")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                                <Settings className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                             </Button>
                        </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );
}
export default MailboxesTab;
