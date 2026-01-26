"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    useReactTable,
    SortingState,
    ColumnFiltersState,
} from "@tanstack/react-table";
import { useState } from "react";
import { MailboxData } from "../../types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Copy, ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const columns: ColumnDef<MailboxData>[] = [
    {
        accessorKey: "email",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Email Account
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const email = row.getValue("email") as string;
            const domain = row.original.domainId;
            const name = email.split('@')[0];

            return (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                        {name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <div className="font-medium flex items-center gap-2">
                            {email}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    navigator.clipboard.writeText(email);
                                    toast.success("Email copied to clipboard");
                                }}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                        <Link href={`/dashboard/domains/${domain}`} className="text-xs text-muted-foreground hover:underline">
                            {domain}
                        </Link>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            return (
                <Badge variant={status === 'active' ? 'default' : 'secondary'} className={
                    status === 'active' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        status === 'warming' ? 'bg-orange-100 text-orange-800 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400' : ''
                }>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
            );
        },
    },
    {
        id: "usage",
        header: "Disk Usage",
        cell: ({ row }) => {
            const usage = row.original.usage || 0;
            const quotaStr = row.original.quota || '0';
            const isUnlimited = quotaStr === 'unlimited';
            const quota = isUnlimited ? Infinity : parseInt(quotaStr) || 0;
            const percent = isUnlimited ? 0 : (quota > 0 ? (usage / quota) * 100 : 0);

            return (
                <div className="w-[140px] space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{usage} MB</span>
                        <span>of {isUnlimited ? '∞' : `${quota} MB`}</span>
                    </div>
                    {!isUnlimited && (
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                                className={`h-full ${percent > 90 ? 'bg-destructive' : 'bg-primary'}`}
                                style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                        </div>
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => {
            const date = row.getValue("createdAt") as Date;
            return (
                <span className="text-muted-foreground text-sm">
                    {date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : 'N/A'}
                </span>
            );
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const mailbox = row.original;
            const domain = mailbox.domainId;
            const webmailUrl = `https://webmail.${domain}`;

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => {
                                navigator.clipboard.writeText(mailbox.email);
                                toast.success("Email address copied");
                            }}
                        >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/dashboard/domains/${domain}`}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Domain
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={webmailUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Open Webmail
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

interface MailboxesTableProps {
    data: MailboxData[];
}

export function MailboxesTable({ data }: MailboxesTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>All Mailboxes</CardTitle>
                    <div className="flex items-center gap-2">
                        <Input
                            placeholder="Filter emails..."
                            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("email")?.setFilterValue(event.target.value)
                            }
                            className="max-w-sm h-8"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="group"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No mailboxes found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
