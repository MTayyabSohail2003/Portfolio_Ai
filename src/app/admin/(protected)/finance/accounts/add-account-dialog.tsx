
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createAccount } from "@/app/actions/finance-actions";
import { toast } from "sonner";
import { Plus, Loader2, RotateCcw } from "lucide-react";
import { usePersistedFormData } from "@/hooks/use-persisted-form-data";

interface AccountFormData {
    name: string;
    type: string;
    balance: string;
    color: string;
}

const initialFormData: AccountFormData = {
    name: "",
    type: "BANK",
    balance: "0",
    color: "#3b82f6",
};

export function AddAccountDialog() {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData, clearFormData] = usePersistedFormData<AccountFormData>(
        "add-account-form",
        initialFormData
    );

    const updateField = <K extends keyof AccountFormData>(field: K, value: AccountFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("type", formData.type);
        submitData.append("balance", formData.balance);
        submitData.append("color", formData.color);

        const res = await createAccount(submitData);
        setIsLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Account created");
            clearFormData();
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> Add Account
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Add New Account
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={clearFormData}
                            className="h-6 w-6 rounded-full hover:bg-muted"
                            title="Reset form"
                        >
                            <RotateCcw className="h-3 w-3" />
                        </Button>
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Account Name</Label>
                        <Input
                            placeholder="e.g. Chase Checking"
                            value={formData.name}
                            onChange={(e) => updateField("name", e.target.value)}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="BANK">Bank</SelectItem>
                                    <SelectItem value="CASH">Cash</SelectItem>
                                    <SelectItem value="CREDIT">Credit Card</SelectItem>
                                    <SelectItem value="INVESTMENT">Investment</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Initial Balance</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={formData.balance}
                                onChange={(e) => updateField("balance", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Color Identity</Label>
                        <div className="flex gap-2">
                            {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#6366f1", "#ec4899"].map(c => (
                                <div key={c} className="flex items-center gap-1">
                                    <input
                                        type="radio"
                                        name="color"
                                        value={c}
                                        className="h-4 w-4"
                                        checked={formData.color === c}
                                        onChange={() => updateField("color", c)}
                                    />
                                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Account
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
