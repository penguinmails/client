"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button/button";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import type { TeamMember, TeamRole } from "@features/team/types";

interface EditMemberDialogProps {
    member: TeamMember | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (
        memberId: string,
        updates: { role?: TeamRole; status?: "active" | "inactive" }
    ) => void;
    loading: boolean;
}

export function EditMemberDialog({
    member,
    open,
    onOpenChange,
    onSave,
    loading,
}: EditMemberDialogProps) {
    const [role, setRole] = useState<TeamRole>(() => member?.role || "member");
    const [status, setStatus] = useState<"active" | "inactive">(() =>
        member?.status === "active" ? "active" : "inactive"
    );

    const handleSave = () => {
        if (!member) return;
        onSave(member.id, { role, status });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Team Member</DialogTitle>
                    <DialogDescription>
                        Update the role and status for {member?.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={role}
                            onValueChange={(value: TeamRole) => setRole(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={status}
                            onValueChange={(value: "active" | "inactive") => setStatus(value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
