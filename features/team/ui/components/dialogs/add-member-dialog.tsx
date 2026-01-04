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
import { Input } from "@/components/ui/input/input";
import { Label } from "@/components/ui/label";
import { RefreshCw } from "lucide-react";
import type { TeamRole } from "@features/team/types";

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (data: {
        email: string;
        password: string;
        role: TeamRole;
        name?: string;
        givenName?: string;
        familyName?: string;
    }) => void;
    loading: boolean;
}

export function AddMemberDialog({
    open,
    onOpenChange,
    onAdd,
    loading,
}: AddMemberDialogProps) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [givenName, setGivenName] = useState("");
    const [familyName, setFamilyName] = useState("");
    const [role, setRole] = useState<TeamRole>("member");

    const handleAdd = () => {
        if (!email.trim() || !password.trim()) return;
        onAdd({
            email: email.trim(),
            password: password.trim(),
            role,
            name: name.trim() || undefined,
            givenName: givenName.trim() || undefined,
            familyName: familyName.trim() || undefined,
        });
        // Reset form
        setEmail("");
        setPassword("");
        setName("");
        setGivenName("");
        setFamilyName("");
        setRole("member");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                        Create a new user account and add them to the team
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </div>
                    <div>
                        <Label htmlFor="name">Full Name (optional)</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter full name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label htmlFor="givenName">First Name (optional)</Label>
                            <Input
                                id="givenName"
                                value={givenName}
                                onChange={(e) => setGivenName(e.target.value)}
                                placeholder="First name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="familyName">Last Name (optional)</Label>
                            <Input
                                id="familyName"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                placeholder="Last name"
                            />
                        </div>
                    </div>
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
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="member">Member</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAdd}
                        disabled={loading || !email.trim() || !password.trim()}
                    >
                        {loading && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                        Create Account
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
