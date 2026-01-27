"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input/input";
import {
    getClients,
    type Client
} from "@/features/leads/actions/clients";
import {
    addContactToLeadListAction
} from "@/features/leads/actions/lists";
import {
    Search,
    UserPlus,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { productionLogger } from "@/lib/logger";

interface AddContactToSegmentDialogProps {
    segmentId: string;
    isOpen: boolean;
    onClose: () => void;
    onContactAdded: () => void;
    existingContactIds: string[];
}

export default function AddContactToSegmentDialog({
    segmentId,
    isOpen,
    onClose,
    onContactAdded,
    existingContactIds,
}: AddContactToSegmentDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [contacts, setContacts] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Filter out contacts already in the segment
    const availableContacts = contacts.filter(
        (c) => !existingContactIds.includes(c.id)
    );

    useEffect(() => {
        if (!isOpen) {
            setSearchQuery("");
            setContacts([]);
            setError(null);
            return;
        }

        const loadAllContacts = async () => {
            setIsLoading(true);
            try {
                const result = await getClients();
                if (result.success && result.data) {
                    setContacts(result.data);
                }
            } catch (err) {
                productionLogger.error("Failed to load contacts for dialog:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadAllContacts();
    }, [isOpen]);

    const filteredContacts = availableContacts.filter(
        (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddContact = async (contactId: string) => {
        setIsAdding(contactId);
        setError(null);
        try {
            const result = await addContactToLeadListAction(segmentId, Number(contactId));
            if (result.success) {
                onContactAdded();
                onClose();
            } else {
                setError(result.error || "Failed to add contact to segment");
            }
        } catch (err) {
            productionLogger.error("Error adding contact to segment:", err);
            setError("An unexpected error occurred.");
        } finally {
            setIsAdding(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md md:max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-primary" />
                        Add Contact to Segment
                    </DialogTitle>
                    <DialogDescription>
                        Search for existing contacts to add them to this segment.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or email..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="p-3 text-xs bg-red-100 border border-red-200 text-red-700 rounded-md flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto pr-2 min-h-[300px] border rounded-md">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-2 py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">Fetching contacts...</p>
                            </div>
                        ) : filteredContacts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center gap-2 py-12">
                                <Search className="w-8 h-8 text-muted-foreground opacity-20" />
                                <p className="text-sm text-muted-foreground">
                                    {searchQuery ? "No matching contacts found." : "No available contacts found."}
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredContacts.map((contact) => (
                                    <div
                                        key={contact.id}
                                        className="flex items-center justify-between p-3 transition-colors hover:bg-accent/50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback className="text-xs bg-linear-to-br from-blue-500 to-purple-600 text-white">
                                                    {contact.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .substring(0, 2)
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-sm truncate">
                                                    {contact.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground truncate">
                                                    {contact.email}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleAddContact(contact.id)}
                                            disabled={!!isAdding}
                                            className="ml-2 hover:bg-primary/10 hover:text-primary transition-all shrink-0"
                                        >
                                            {isAdding === contact.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="border-t pt-4">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
