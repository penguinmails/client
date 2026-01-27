import { getLeadListById } from "@/features/leads/actions/lists";
import SegmentDetail from "@/features/leads/ui/components/SegmentDetail";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{
        id: string;
        locale: string;
    }>;
}

export default async function SegmentDetailPage({ params }: PageProps) {
    const { id } = await params;

    const result = await getLeadListById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return (
        <SegmentDetail segment={result.data} />
    );
}
