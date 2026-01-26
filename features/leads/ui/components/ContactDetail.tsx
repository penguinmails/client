"use client";

import { type Client } from "@/features/leads/actions/clients";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button/button";
import { ArrowLeft, Building, Calendar, Mail, Phone, Tag, User } from "lucide-react";
import Link from "next/link";

interface ContactDetailProps {
    client: Client;
}

const getStatusColor = (status: string | undefined) => {
    const statusLower = (status || "new").toLowerCase();
    const colors: Record<string, string> = {
        replied: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
        sent: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
        bounced: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30",
        new: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30",
        contacted: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30",
        qualified: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
        converted: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30",
        active: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30",
        inactive: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300 dark:border-gray-500/30",
        prospect: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30",
    };
    return colors[statusLower] || colors.new;
};

export default function ContactDetail({ client }: ContactDetailProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard/leads?tab=contacts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Contact Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarFallback className="text-xl bg-linear-to-br from-blue-500 to-purple-600 text-white">
                                        {client.name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .join("")
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-2xl">{client.name}</CardTitle>
                                    <div className="text-muted-foreground mt-1 flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        {client.email}
                                    </div>
                                </div>
                            </div>
                            <Badge
                                variant="outline"
                                className={`text-sm px-3 py-1 ${getStatusColor(client.status)}`}
                            >
                                {client.status
                                    .replace("-", " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Building className="w-4 h-4" /> Company
                                </label>
                                <p>{client.company || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> Phone
                                </label>
                                <p>{client.phone || "N/A"}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Tags
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {client.tags && client.tags.length > 0 ? (
                                    client.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-sm text-muted-foreground">No tags</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Metadata Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Metadata</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Created At
                            </label>
                            <p className="text-sm">
                                {client.createdAt
                                    ? new Date(client.createdAt).toLocaleString()
                                    : "Unknown"}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <User className="w-4 h-4" /> ID
                            </label>
                            <p className="text-sm font-mono text-muted-foreground">
                                {client.id}
                            </p>
                        </div>

                        <div className="pt-4 border-t">
                            <Button className="w-full" variant="outline" disabled>
                                Edit Contact (Coming Soon)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
