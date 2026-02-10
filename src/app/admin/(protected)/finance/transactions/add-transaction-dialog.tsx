
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { createTransaction } from "@/app/actions/finance-actions";
import { toast } from "sonner";
import { Plus, Loader2, RotateCcw } from "lucide-react";
import { usePersistedFormData } from "@/hooks/use-persisted-form-data";

interface TransactionFormData {
    type: string;
    amount: string;
    date: string;
    accountId: string;
    categoryId: string;
    description: string;
}

const initialFormData: TransactionFormData = {
    type: "EXPENSE",
    amount: "",
    date: new Date().toISOString().slice(0, 16),
    accountId: "",
    categoryId: "",
    description: "",
};

export function AddTransactionDialog({ accounts, categories }: { accounts: any[], categories: any[] }) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData, clearFormData] = usePersistedFormData<TransactionFormData>(
        "add-transaction-form",
        initialFormData
    );

    const updateField = <K extends keyof TransactionFormData>(field: K, value: TransactionFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);

        const submitData = new FormData();
        submitData.append("type", formData.type);
        submitData.append("amount", formData.amount);
        submitData.append("date", formData.date);
        submitData.append("accountId", formData.accountId);
        submitData.append("categoryId", formData.categoryId);
        submitData.append("description", formData.description);

        const res = await createTransaction(submitData);
        setIsLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Transaction recorded");
            clearFormData(); // Clear persisted data on success
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> Record Transaction
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Record New {formData.type === "INCOME" ? "Income" : "Expense"}
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={formData.type} onValueChange={(v) => updateField("type", v)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="EXPENSE">Expense</SelectItem>
                                    <SelectItem value="INCOME">Income</SelectItem>
                                    <SelectItem value="TRANSFER">Transfer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Amount</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => updateField("amount", e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="datetime-local"
                            value={formData.date}
                            onChange={(e) => updateField("date", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Account</Label>
                        <Select value={formData.accountId} onValueChange={(v) => updateField("accountId", v)}>
                            <SelectTrigger><SelectValue placeholder="Select Account" /></SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc._id} value={acc._id}>
                                        {acc.name} ({acc.currency} {acc.balance})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={formData.categoryId} onValueChange={(v) => updateField("categoryId", v)}>
                            <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                            <SelectContent>
                                {categories?.filter(c => c.type === formData.type).map(cat => (
                                    <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                                ))}
                                <SelectItem value="other">Uncategorized</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            placeholder="Lunch, Uber, Salary..."
                            rows={2}
                            value={formData.description}
                            onChange={(e) => updateField("description", e.target.value)}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Transaction
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
