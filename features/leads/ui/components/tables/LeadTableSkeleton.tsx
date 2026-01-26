"use client";

import { TableCell, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface LeadTableSkeletonProps {
    columns: number;
    rows?: number;
}

export default function LeadTableSkeleton({ columns, rows = 5 }: LeadTableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={`skeleton-row-${rowIndex}`}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <TableCell key={`skeleton-col-${colIndex}`}>
                            <Skeleton className="h-6 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}
