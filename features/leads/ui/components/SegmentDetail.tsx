"use client";

import { type LeadList } from "@/features/leads/actions/index";
import {
    getClients,
    type Client
} from "@/features/leads/actions/clients";
import {
    removeContactFromLeadListAction
} from "@/features/leads/actions/lists";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button/button";
import {
    ArrowLeft,
    Calendar,
    Users,
    Edit,
    Trash2,
    UserPlus,
    Clock,
    Search,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import AddContactToSegmentDialog from "./AddContactToSegmentDialog";
import { productionLogger } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input/input";

interface SegmentDetailProps {
    segment: LeadList;
}

/**
 * Format a date string to a readable format
 */
function formatDate(dateString?: string | Date): string {
    if (!dateString) return "—";
    try {
        const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

export default function SegmentDetail({ segment }: SegmentDetailProps) {
    const router = useRouter();
    const [contacts, setContacts] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const loadContacts = useCallback(async () => {
        setIsLoading(true);
        const result = await getClients({ listId: segment.id, listAlias: segment.alias });
        if (result.success && result.data) {
            setContacts(result.data);
        }
        setIsLoading(false);
    }, [segment.id, segment.alias]);

    useEffect(() => {
        let isMounted = true;
        if (isMounted) {
            loadContacts();
        }
        return () => { isMounted = false; };
    }, [segment.id, loadContacts]);

    const handleRemoveContact = async (contactId: string) => {
        setIsRemoving(contactId);
        try {
            const result = await removeContactFromLeadListAction(segment.id, Number(contactId));
            if (result.success) {
                setContacts(prev => prev.filter(c => c.id !== contactId));
                router.refresh();
            } else {
                productionLogger.error("Failed to remove contact:", result.error);
                alert("Failed to remove contact. Please try again.");
            }
        } catch (error) {
            productionLogger.error("Error removing contact:", error);
        } finally {
            setIsRemoving(null);
        }
    };

    const filteredContacts = contacts.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/leads?tab=lists">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">{segment.name}</h1>
                        <p className="text-sm text-muted-foreground font-mono">{segment.alias}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/dashboard/leads/segments/${segment.id}/edit`}>
                        <Button variant="outline" className="gap-2">
                            <Edit className="w-4 h-4" />
                            Edit Segment
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Info Card */}
                <Card className="md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-lg">Segment Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <Users className="w-3 h-3" /> Contacts
                            </label>
                            <p className="text-2xl font-bold">{contacts.length}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <Clock className="w-3 h-3" /> Status
                            </label>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${segment.isPublished
                                ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/20 dark:text-green-300 dark:border-green-500/30"
                                : "bg-muted text-muted-foreground border-border"
                                }`}>
                                {segment.isPublished ? "Published" : "Unpublished"}
                            </span>
                        </div>
                        <div className="space-y-1 pt-2 border-t">
                            <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> Created
                            </label>
                            <p className="text-sm">{formatDate(segment.dateAdded)}</p>
                        </div>
                        {segment.description && (
                            <div className="space-y-1 pt-2 border-t">
                                <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
                                <p className="text-sm text-muted-foreground">{segment.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Contacts Management Card */}
                <Card className="md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-lg font-semibold">Contacts in Segment</CardTitle>
                        <Button className="gap-2" size="sm" onClick={() => setIsAddDialogOpen(true)}>
                            <UserPlus className="w-4 h-4" />
                            Add Contact
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search contacts in this segment..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="rounded-md border overflow-hidden">
                            <Table>
                                <TableHeader className="bg-gray-50 dark:bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[300px]">Contact</TableHead>
                                        <TableHead>Company</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                                    <p className="text-sm text-muted-foreground">Loading contacts...</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredContacts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                                                No contacts found in this segment.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredContacts.map(contact => (
                                            <TableRow key={contact.id} className="group">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs bg-linear-to-br from-blue-500 to-purple-600 text-white">
                                                                {contact.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm">{contact.name}</span>
                                                            <span className="text-xs text-muted-foreground">{contact.email}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {contact.company || "—"}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {contact.tags.slice(0, 2).map(tag => (
                                                            <Badge key={tag} variant="secondary" className="px-1.5 py-0 text-xs">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {contact.tags.length > 2 && (
                                                            <span className="text-xs text-muted-foreground">+{contact.tags.length - 2}</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                        onClick={() => handleRemoveContact(contact.id)}
                                                                        disabled={isRemoving === contact.id}
                                                                    >
                                                                        {isRemoving === contact.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Remove from segment</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <AddContactToSegmentDialog
                segmentId={segment.id}
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                onContactAdded={loadContacts}
                existingContactIds={contacts.map(c => c.id)}
            />
        </div>
    );
}
