"use client";
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
import { cn } from "@/lib/utils/cn";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Loader2,
  Mail,
  Pause,
  Play,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { DomainWithMailboxesData } from "@features/domains/actions";

function WarmupTab({
  domainsData,
  loading,
  error,
}: {
  domainsData: DomainWithMailboxesData[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-8">
      <WarmupMailboxesTable
        domainsData={domainsData}
        loading={loading}
        error={error}
      />
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <div className={cn("p-2 rounded-lg", "bg-blue-100")}>
              <AlertTriangle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium mb-2">Warmup Best Practices</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Start with 5-10 emails per day and gradually increase volume
                </li>
                <li>
                  • Maintain consistent sending patterns to build reputation
                </li>
                <li>• Engage with warmup replies to improve deliverability</li>
                <li>• Monitor spam folder placement and adjust if needed</li>
                <li>
                  • Complete warmup process takes 2-4 weeks for optimal results
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WarmupTab;

function WarmupMailboxesTable({
  domainsData,
  loading,
  error,
}: {
  domainsData: DomainWithMailboxesData[];
  loading: boolean;
  error: string | null;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WARMED":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
            <CheckCircle className="w-3 h-3" />
            Ready
          </Badge>
        );
      case "WARMING":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 gap-1">
            <Clock className="w-3 h-3" />
            Warming
          </Badge>
        );
      case "PAUSED":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 gap-1">
            <Pause className="w-3 h-3" />
            Paused
          </Badge>
        );
      case "NOT_STARTED":
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 gap-1">
            <Clock className="w-3 h-3" />
            Not Started
          </Badge>
        );
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warmup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading domain data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warmup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-2" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Flatten all mailboxes from all domains
  const allMailboxes = domainsData.flatMap((domainData) =>
    domainData.mailboxes.map((mailbox: any) => ({
      ...mailbox,
      domainName: domainData.domain.domain,
    }))
  );

  if (allMailboxes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warmup Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <span>No domains found</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border rounded-xl bg-card shadow-sm">
      <div className="p-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Warmup Status</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
          <Link href="/dashboard/analytics/mailboxes">
            <Button variant="ghost" size="icon">
              <BarChart3 className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-100 dark:bg-muted">
              <TableRow>
                <TableHead>Mailbox</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Count</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Days Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allMailboxes.map((mailbox: any) => {
                const replyRate = mailbox.totalWarmups > 0
                  ? ((mailbox.replies / mailbox.totalWarmups) * 100).toFixed(1)
                  : 0;

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
                          Domain: {mailbox.domainName}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      {getStatusBadge(mailbox.warmupStatus)}
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                          {mailbox.dailyVolume} emails
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Daily warmup count
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-gray-900 dark:text-foreground">
                            {mailbox.totalWarmups?.toLocaleString() || 0}
                          </span>
                          <span className="text-xs text-gray-500">
                            total sent
                          </span>
                        </div>
                        <div className="text-xs text-green-600">
                          {mailbox.replies} replies ({replyRate}%)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-6">
                      <div className="text-sm font-medium text-gray-900 dark:text-foreground">
                        {mailbox.daysActive} days
                      </div>
                      <div className="text-xs text-gray-500">Active period</div>
                    </TableCell>
                    <TableCell className="px-6 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {mailbox.warmupStatus === "PAUSED" ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-green-600">
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-yellow-600">
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                          <Settings className="h-4 w-4" />
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
