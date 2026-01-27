"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    updateClient,
    type Client
} from "@/features/leads/actions/clients";
import {
    Mail,
    User,
    Building,
    Phone,
    Save,
    X
} from "lucide-react";
import { productionLogger } from "@/lib/logger";

interface LeadEditFormProps {
    client: Client;
}

export default function LeadEditForm({ client }: LeadEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData(event.currentTarget);
            const firstName = formData.get("firstName") as string;
            const lastName = formData.get("lastName") as string;

            const result = await updateClient(client.id, {
                email: formData.get("email") as string,
                name: `${firstName} ${lastName}`.trim(),
                company: formData.get("company") as string,
                phone: formData.get("phone") as string,
            });

            if (result.success) {
                router.push(`/dashboard/leads/contacts/${client.id}`);
                router.refresh();
            } else {
                setError(result.error || "Failed to update contact");
            }
        } catch (err: unknown) {
            productionLogger.error("Failed to update contact:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const nameParts = client.name.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Edit Contact Information
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {error && (
                        <div className="p-3 text-sm bg-red-100 border border-red-200 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
                                <User className="w-4 h-4 text-muted-foreground" /> First Name
                            </label>
                            <Input
                                id="firstName"
                                name="firstName"
                                defaultValue={firstName}
                                placeholder="John"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium">
                                Last Name
                            </label>
                            <Input
                                id="lastName"
                                name="lastName"
                                defaultValue={lastName}
                                placeholder="Doe"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground" /> Email Address
                        </label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            defaultValue={client.email}
                            placeholder="john.doe@example.com"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-medium flex items-center gap-2">
                                <Building className="w-4 h-4 text-muted-foreground" /> Company
                            </label>
                            <Input
                                id="company"
                                name="company"
                                defaultValue={client.company || ""}
                                placeholder="Acme Inc."
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" /> Phone Number
                            </label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                defaultValue={client.phone || ""}
                                placeholder="+1 234 567 890"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t">
                        <Button type="submit" className="gap-2" disabled={loading}>
                            <Save className="w-4 h-4" />
                            {loading ? "Saving Changes..." : "Save Changes"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="gap-2"
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
