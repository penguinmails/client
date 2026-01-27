import { getLeadListById } from "@/features/leads/actions/lists";
import SegmentEditForm from "@/features/leads/ui/components/forms/SegmentEditForm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function SegmentEditPage({ params }: PageProps) {
    const { id } = await params;

    const result = await getLeadListById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href={`/dashboard/leads/segments/${id}`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">Edit Segment</h1>
                    <p className="text-sm text-muted-foreground font-medium">Update metadata for {result.data.name}</p>
                </div>
            </div>

            <SegmentEditForm segment={result.data} />
        </div>
    );
}
