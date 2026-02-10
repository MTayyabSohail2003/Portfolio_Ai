"use client";

import { useMutation } from "@apollo/client/react";
import { GET_WORKSPACE } from "@/graphql/queries";
import { CREATE_BOARD } from "@/graphql/mutations";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

export function CreateBoardDialog({ workspaceId }: { workspaceId: string }) {
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [createBoard, { loading }] = useMutation(CREATE_BOARD, {
        refetchQueries: [{ query: GET_WORKSPACE, variables: { id: workspaceId } }],
        onCompleted: () => {
            setOpen(false);
            setName("");
            toast.success("Board created");
        },
        onError: (err: any) => toast.error(err.message)
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createBoard({ variables: { workspaceId, name } });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> New Board</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Create Board</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Board Name</Label>
                        <Input value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>Create</Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
