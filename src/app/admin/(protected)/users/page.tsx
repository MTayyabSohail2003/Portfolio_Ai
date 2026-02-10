"use client";

import { useState, useEffect } from "react";
import { client, useSession } from "@/lib/auth-client"; // Importing the client we configured
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Trash2, Shield, ShieldAlert, User } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { toast } from "sonner";

export default function UserManagementPage() {
    const { data: session } = useSession();
    const isSuperAdmin = session?.user?.role === "super-admin";

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    
    // New User State
    const [newName, setNewName] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRole, setNewRole] = useState("user");
    const [creating, setCreating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            
            if (res.ok) {
                setUsers(data.users || []);
            } else {
                 toast.error(data.error || "Failed to fetch users");
            }
        } catch (error: any) {
            console.error("Fetch users error:", error);
            toast.error("Failed to fetch users: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async () => {
        if (!newName || !newEmail || !newPassword) {
            toast.error("Please fill all fields");
            return;
        }

        setCreating(true);
        try {
            
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, email: newEmail, password: newPassword, role: newRole })
            });
            
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create");
            }

            toast.success("User created successfully");
            setIsCreateOpen(false);
            setNewName("");
            setNewEmail("");
            setNewPassword("");
            fetchUsers();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setCreating(false);
        }
    };

    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!userToDelete) return;
        try {
             const res = await fetch(`/api/admin/users/${userToDelete}`, {
                method: "DELETE",
            });
            
            if (!res.ok) throw new Error("Failed to delete");
            
            toast.success("User deleted");
            fetchUsers();
        } catch (error) {
            toast.error("Could not delete user");
        } finally {
            setUserToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <ConfirmModal 
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
            />
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage system access and roles.</p>
                </div>
                {isSuperAdmin && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Full Name</Label>
                                    <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="John Doe" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="john@example.com" type="email" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Password</Label>
                                    <Input value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select value={newRole} onValueChange={setNewRole}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="super-admin">Super Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full" onClick={handleCreateUser} disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create User
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registered Users</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <TableSkeleton rowCount={5} columnCount={4} />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Joined</TableHead>
                                    {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={isSuperAdmin ? 4 : 3} className="text-center h-24 text-muted-foreground">
                                            No users found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                 <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{user.name}</span>
                                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'super-admin' ? 'destructive' : user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                                                {user.role === 'super-admin' && <ShieldAlert className="mr-1 h-3 w-3" />}
                                                {user.role === 'admin' && <Shield className="mr-1 h-3 w-3" />}
                                                {user.role === 'user' && <User className="mr-1 h-3 w-3" />}
                                                {user.role || 'user'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        {isSuperAdmin && (
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setUserToDelete(user.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
