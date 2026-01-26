"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@features/domains/lib/utils";
import { AlertTriangle, Check, Copy, Trash2, X, ExternalLink, Info } from "lucide-react";
import { formatDistanceToNow, differenceInDays } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const formatAddedDate = (dateString: string | null) => {
  if (!dateString) {
    return "date unknown";
  }

  const date = new Date(dateString);
  const now = new Date();
  const daysDiff = differenceInDays(now, date);

  if (daysDiff >= 14 && daysDiff < 30) {
    const weeks = Math.floor(daysDiff / 7);
    return `${weeks} weeks ago`;
  }

  return formatDistanceToNow(date, { addSuffix: true });
};
export const getRecordIcon = (status: string) => {
  switch (status) {
    case "verified":
      return <Check className="w-4 h-4 text-green-600" />;
    case "pending":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />;
    case "failed":
      return <X className="w-4 h-4 text-red-600" />;
    default:
      return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
  }
};

interface DomainsTabProps {
  domains: Array<{
    id: number;
    domain: string;
    status: string;
    type?: 'WEB' | 'DNS' | 'BOTH';
    categories?: string[];
    mailboxes: number;
    records: {
      spf: string;
      dkim: string;
      dmarc: string;
      mx: string;
    };
    addedDate: string | null;
    expirationDate?: string | null;
  }>;
  dnsRecords: Array<{
    name: string;
    value: string;
  }>;
}

function DomainsTab({ domains, dnsRecords }: DomainsTabProps) {
  const params = useParams();
  const locale = params.locale as string;

  return (
    <TooltipProvider>
      <div>
        {domains.map((domain) => (
          <Card key={domain.id} className="p-6 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between p-0 mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <Link href={`/${locale}/dashboard/domains/${domain.domain}`} className="hover:underline decoration-primary/50 underline-offset-4 decoration-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {domain.domain}
                    </h3>
                  </Link>
                  <div className="flex gap-2">
                    {domain.categories?.includes('DNS') && (
                      <Badge variant="outline" className="text-xs uppercase bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-900 px-1.5 py-0">
                        DNS Managed
                      </Badge>
                    )}
                    {domain.categories?.includes('WEB') && (
                      <Badge variant="outline" className="text-xs uppercase bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900 px-1.5 py-0">
                        Web Hosted
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <Badge
                    variant={
                      domain.status === "verified" ? "default" : "secondary"
                    }
                    className={cn(getStatusColor(domain.status.toUpperCase()))}
                  >
                    {domain.status.toUpperCase() === "VERIFIED"
                      ? "Verified"
                      : "Pending Verification"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {domain.mailboxes} mailboxes
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Added {formatAddedDate(domain.addedDate)}
                  </span>
                  {domain.expirationDate && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                      Expires {formatAddedDate(domain.expirationDate)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button asChild variant="outline" size="sm" className="hidden sm:flex gap-2">
                  <Link href={`/${locale}/dashboard/domains/${domain.domain}`}>
                    <ExternalLink className="w-4 h-4" />
                    View Details
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {dnsRecords.map((record, index) => {
                  const recordNamePart = record.name.split(" ")[0];
                  const recordKey = record.name
                    .toLowerCase()
                    .split(" ")[0] as keyof typeof domain.records;
                  const recordValue = domain.records[recordKey];
                  const isVerified = recordValue && recordValue !== 'not found' && !recordValue.includes('pending');

                  // Tooltip Metadata
                  let recordType = "TXT";
                  let recordHost = "@";
                  if (recordKey === 'mx') { recordType = "MX"; recordHost = "@"; }
                  if (recordKey === 'dmarc') { recordHost = "_dmarc"; }
                  if (recordKey === 'dkim') { recordHost = "selector._domainkey"; }

                  return (
                    <Card key={index} className="bg-card border shadow-sm p-0 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-foreground uppercase">
                            {recordNamePart}
                          </span>
                          {getRecordIcon(isVerified ? 'verified' : 'pending')}
                        </div>
                        <div className="bg-muted/30 rounded p-2 mb-3">
                          <p className="text-xs font-mono text-muted-foreground break-all line-clamp-2 min-h-[2.5rem]">
                            {recordValue || record.value}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={!recordValue || recordValue === 'not found'}
                            onClick={() => {
                              if (recordValue) {
                                navigator.clipboard.writeText(recordValue);
                                toast.success(`Copied ${record.name}`);
                              }
                            }}
                            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </Button>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground hover:text-primary">
                                <Info className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[280px] p-3 text-xs bg-slate-100 text-slate-900 border-slate-300">
                              <p className="font-semibold mb-1">{record.name}</p>
                              <div className="space-y-1 text-muted-foreground">
                                <div className="flex justify-between gap-4">
                                  <span>Type:</span> <span className="font-mono text-foreground">{recordType}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span>Host:</span> <span className="font-mono text-foreground">{recordHost}</span>
                                </div>
                                <p className="pt-2 border-t mt-2">
                                  Go to the <span className="font-medium text-foreground">View Details &gt; DNS Records</span> tab to view the full configuration.
                                </p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {domain.status.toUpperCase() === "PENDING" && (
                <Card className="mt-4 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-900 dark:text-orange-100">
                          DNS Setup Required
                        </h4>
                        <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                          Please add the DNS records above to your domain&apos;s
                          DNS settings. Once added, verification typically takes
                          5-15 minutes.
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 h-auto p-0 text-orange-700 hover:text-orange-900"
                        >
                          Check DNS Status
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
export default DomainsTab;
