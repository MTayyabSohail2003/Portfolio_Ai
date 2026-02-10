"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteInvestment } from "@/app/actions/investment-actions";
import { toast } from "sonner";

export function DeleteButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (!confirm("Are you sure?")) return;
        
        try {
            await deleteInvestment(id);
            toast.success("Asset deleted");
        } catch(e) {
            toast.error("Failed to delete");
        }
    };

    return (
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
