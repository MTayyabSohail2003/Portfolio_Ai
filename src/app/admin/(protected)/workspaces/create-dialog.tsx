"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_WORKSPACE } from "@/graphql/mutations";
import { GET_WORKSPACES } from "@/graphql/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "sonner";

export function CreateWorkspaceDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");

  const [createWorkspace, { loading }] = useMutation(CREATE_WORKSPACE, {
    refetchQueries: [{ query: GET_WORKSPACES }],
    onCompleted: () => {
      setOpen(false);
      setName("");
      setDesc("");
      toast.success("Workspace created");
    },
    onError: (err: any) => {
      toast.error(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createWorkspace({ variables: { name, description: desc } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Engineering, Marketing, etc."
                required
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                placeholder="What is this workspace for?"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating..." : "Create Workspace"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
