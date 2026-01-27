"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    updateLeadListAction
} from "@/features/leads/actions/lists";
import { type LeadList } from "@/features/leads/actions/index";
import {
    Save,
    X,
    FileText,
    Link as LinkIcon
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { productionLogger } from "@/lib/logger";

interface SegmentEditFormProps {
    segment: LeadList;
}

export default function SegmentEditForm({ segment }: SegmentEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPublished, setIsPublished] = useState(segment.isPublished ?? true);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(event.currentTarget);

            const result = await updateLeadListAction(segment.id, {
                name: formData.get("name") as string,
                alias: formData.get("alias") as string,
                description: formData.get("description") as string,
                isPublished,
            });

            if (result.success) {
                router.push(`/dashboard/leads/segments/${segment.id}`);
                router.refresh();
            } else {
                setError(result.error || "Failed to update segment");
            }
        } catch (err: unknown) {
            productionLogger.error("Failed to update segment:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-lg border-muted/50 transition-all hover:border-primary/20">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Edit Segment Details
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm bg-red-100 border border-red-200 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                            Segment Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={segment.name}
                            placeholder="e.g., Marketing Leads"
                            required
                            className="bg-muted/30 focus-visible:ring-primary/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="alias" className="text-sm font-semibold flex items-center gap-2">
                            <LinkIcon className="w-4 h-4 text-muted-foreground" />
                            Alias
                        </Label>
                        <Input
                            id="alias"
                            name="alias"
                            defaultValue={segment.alias}
                            placeholder="marketing-leads"
                            required
                            className="bg-muted/30 focus-visible:ring-primary/30"
                        />
                        <p className="text-xs text-muted-foreground uppercase tracking-tight">Machine-readable name used for API queries and filters.</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-semibold">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={segment.description}
                            placeholder="Briefly describe the purpose of this segment..."
                            className="min-h-[100px] bg-muted/30 focus-visible:ring-primary/30"
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-muted/50 bg-accent/50 group transition-all hover:bg-accent/80">
                        <div className="space-y-0.5">
                            <Label className="text-base font-semibold">Published</Label>
                            <p className="text-xs text-muted-foreground">Make this segment active and available for use in campaigns.</p>
                        </div>
                        <Switch
                            id="isPublished"
                            checked={isPublished}
                            onCheckedChange={setIsPublished}
                        />
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <Button type="submit" className="gap-2 px-6" disabled={loading}>
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2 px-6"
                            onClick={() => router.back()}
                            disabled={loading}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
