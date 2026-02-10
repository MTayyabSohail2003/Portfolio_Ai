"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InviteMemberDialogProps {
    workspaceId: string;
}

export function InviteMemberDialog({ workspaceId }: InviteMemberDialogProps) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("viewer");
    const [name, setName] = useState("");
    const [showNameInput, setShowNameInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body: any = { workspaceId, email, role };
            if (showNameInput && name) {
                body.name = name;
            }

            const res = await fetch("/api/workspaces/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 404 && data.code === "USER_NOT_FOUND") {
                    setShowNameInput(true);
                    toast.info(data.error);
                    setLoading(false);
                    return; // Stop here and let user enter name
                }
                throw new Error(data.error || "Failed to invite member");
            }

            toast.success("Member added successfully");
            setOpen(false);
            setEmail("");
            setName("");
            setRole("viewer");
            setShowNameInput(false);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
                setShowNameInput(false);
                setName("");
                setEmail("");
            }
        }}>
            <DialogTrigger asChild>
                <Button className="shrink-0 gap-2">
                    <UserPlus className="h-4 w-4" />
                    Invite Member
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                        {showNameInput
                            ? "This user is new! Please provide their name to create an account."
                            : "Add a member to this workspace or invite a new user."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input
                            type="email"
                            placeholder="colleague@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={showNameInput}
                        />
                    </div>

                    {showNameInput && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                            <Label>Full Name</Label>
                            <Input
                                type="text"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required={showNameInput}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (showNameInput ? "Create & Add User" : "Add Member")}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
