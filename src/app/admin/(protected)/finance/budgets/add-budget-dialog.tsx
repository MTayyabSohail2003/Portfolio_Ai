
"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { createBudget, createCategory } from "@/app/actions/finance-actions";
import { toast } from "sonner";
import { Plus, Loader2, RotateCcw, PlusCircle } from "lucide-react";
import { usePersistedFormData } from "@/hooks/use-persisted-form-data";
import { useRouter } from "next/navigation";

interface BudgetFormData {
    categoryId: string;
    amount: string;
    period: string;
    alertsThreshold: string;
}

const initialFormData: BudgetFormData = {
    categoryId: "",
    amount: "",
    period: "MONTHLY",
    alertsThreshold: "80",
};

interface Category {
    _id: string;
    name: string;
    type: string;
    color: string;
}

// Default expense categories to create if none exist
const defaultExpenseCategories = [
    { name: "Food & Dining", color: "#f59e0b" },
    { name: "Transportation", color: "#3b82f6" },
    { name: "Shopping", color: "#ec4899" },
    { name: "Entertainment", color: "#8b5cf6" },
    { name: "Utilities", color: "#10b981" },
    { name: "Healthcare", color: "#ef4444" },
];

export function AddBudgetDialog({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingCategories, setIsCreatingCategories] = useState(false);
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
    const [formData, setFormData, clearFormData] = usePersistedFormData<BudgetFormData>(
        "add-budget-form",
        initialFormData
    );

    const updateField = <K extends keyof BudgetFormData>(field: K, value: BudgetFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // Filter to only expense categories
    const expenseCategories = categories?.filter(c => c.type === "EXPENSE") || [];

    async function createDefaultCategories() {
        setIsCreatingCategories(true);
        try {
            for (const cat of defaultExpenseCategories) {
                const formData = new FormData();
                formData.append("name", cat.name);
                formData.append("type", "EXPENSE");
                formData.append("color", cat.color);
                await createCategory(formData);
            }
            toast.success("Default categories created!");
            router.refresh();
        } catch {
            toast.error("Failed to create categories");
        }
        setIsCreatingCategories(false);
    }

    async function handleCreateCategory() {
        if (!newCategoryName.trim()) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("name", newCategoryName);
        formData.append("type", "EXPENSE");
        formData.append("color", newCategoryColor);

        const res = await createCategory(formData);
        setIsLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Category created!");
            setNewCategoryName("");
            setShowNewCategory(false);
            router.refresh();
        }
    }

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!formData.categoryId) {
            toast.error("Please select a category");
            return;
        }

        setIsLoading(true);

        const submitData = new FormData();
        submitData.append("categoryId", formData.categoryId);
        submitData.append("amount", formData.amount);
        submitData.append("period", formData.period);
        submitData.append("alertsThreshold", formData.alertsThreshold);

        const res = await createBudget(submitData);
        setIsLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Budget created");
            clearFormData();
            setOpen(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" /> Set Budget
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Set New Budget
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

                {expenseCategories.length === 0 ? (
                    <div className="space-y-4">
                        <div className="text-center py-4 space-y-2">
                            <p className="text-muted-foreground">No expense categories found.</p>
                            <p className="text-sm text-muted-foreground">
                                You need expense categories to create budgets.
                            </p>
                        </div>
                        <Button
                            onClick={createDefaultCategories}
                            className="w-full"
                            disabled={isCreatingCategories}
                        >
                            {isCreatingCategories && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Default Categories
                        </Button>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or create custom</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Input
                                placeholder="Category name (e.g., Groceries)"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                            />
                            <div className="flex gap-2">
                                {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map(c => (
                                    <div
                                        key={c}
                                        className={`w-8 h-8 rounded-full cursor-pointer border-2 ${newCategoryColor === c ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: c }}
                                        onClick={() => setNewCategoryColor(c)}
                                    />
                                ))}
                            </div>
                            <Button
                                onClick={handleCreateCategory}
                                variant="outline"
                                className="w-full"
                                disabled={!newCategoryName.trim() || isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Category
                            </Button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Category</Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowNewCategory(!showNewCategory)}
                                    className="h-6 text-xs"
                                >
                                    <PlusCircle className="mr-1 h-3 w-3" /> New
                                </Button>
                            </div>

                            {showNewCategory ? (
                                <div className="space-y-2 p-3 border rounded-lg bg-muted/50">
                                    <Input
                                        placeholder="Category name"
                                        value={newCategoryName}
                                        onChange={(e) => setNewCategoryName(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        {["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"].map(c => (
                                            <div
                                                key={c}
                                                className={`w-6 h-6 rounded-full cursor-pointer border-2 ${newCategoryColor === c ? 'border-primary' : 'border-transparent'}`}
                                                style={{ backgroundColor: c }}
                                                onClick={() => setNewCategoryColor(c)}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            onClick={handleCreateCategory}
                                            size="sm"
                                            disabled={!newCategoryName.trim() || isLoading}
                                        >
                                            {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                            Add
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setShowNewCategory(false)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <Select value={formData.categoryId} onValueChange={(v) => updateField("categoryId", v)}>
                                    <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                                    <SelectContent>
                                        {expenseCategories.map(cat => (
                                            <SelectItem key={cat._id} value={cat._id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                                    {cat.name}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Budget Limit ($)</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="500.00"
                                    value={formData.amount}
                                    onChange={(e) => updateField("amount", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Period</Label>
                                <Select value={formData.period} onValueChange={(v) => updateField("period", v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                                        <SelectItem value="YEARLY">Yearly</SelectItem>
                                        <SelectItem value="ONE_TIME">One Time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Alert Threshold (%)</Label>
                            <Input
                                type="number"
                                min="1"
                                max="100"
                                placeholder="80"
                                value={formData.alertsThreshold}
                                onChange={(e) => updateField("alertsThreshold", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Get notified when spending reaches this percentage
                            </p>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Budget
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
