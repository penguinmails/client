"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Copy, Info } from "lucide-react";
import { toast } from "sonner";
import { HestiaDnsRecordCollection } from "../../../infrastructure/types/hestia";

interface DnsRecordsTableProps {
    records: HestiaDnsRecordCollection;
}

export function DnsRecordsTable({ records }: DnsRecordsTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Resource Records</CardTitle>
                <CardDescription>Live DNS entries stored on the infrastructure node.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="relative overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Record</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Value</th>
                                <th className="px-4 py-3">TTL</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {Object.entries(records).map(([id, rec]) => {
                                // Infer logical type/host for tooltip if standard
                                let tooltipType = rec.TYPE;
                                const tooltipHost = rec.RECORD || '@';

                                // Normalize for standardized tooltip message if it matches known patterns
                                if (rec.TYPE === 'TXT' && rec.VALUE.includes('v=spf1')) { tooltipType = "TXT (SPF)"; }
                                if (rec.TYPE === 'TXT' && rec.RECORD.includes('_dmarc')) { tooltipType = "TXT (DMARC)"; }
                                if (rec.TYPE === 'TXT' && rec.RECORD.includes('_domainkey')) { tooltipType = "TXT (DKIM)"; }

                                return (
                                    <tr key={id} className="hover:bg-muted/50 transition-colors group">
                                        <td className="px-4 py-3 font-mono font-semibold">{rec.RECORD || '@'}</td>
                                        <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{rec.TYPE}</Badge></td>
                                        <td className="px-4 py-3 font-mono text-xs max-w-md truncate hover:whitespace-normal hover:overflow-visible hover:bg-background hover:z-10 relative">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="truncate">{rec.VALUE}</span>
                                                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(rec.VALUE);
                                                            toast.success("Record value copied");
                                                        }}
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                                                                <Info className="h-3 w-3" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent side="left" className="p-3 text-xs">
                                                            <p className="font-semibold mb-1">DNS Record</p>
                                                            <div className="space-y-1 text-muted-foreground">
                                                                <div className="flex justify-between gap-4">
                                                                    <span>Type:</span> <span className="font-mono text-foreground">{tooltipType}</span>
                                                                </div>
                                                                <div className="flex justify-between gap-4">
                                                                    <span>Host:</span> <span className="font-mono text-foreground">{tooltipHost}</span>
                                                                </div>
                                                            </div>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{rec.TTL}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
