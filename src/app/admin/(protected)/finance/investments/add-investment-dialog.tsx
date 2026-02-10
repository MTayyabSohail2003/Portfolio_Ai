"use client";

import { GravityModal } from "@/components/ui/gravity-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { createInvestment } from "@/app/actions/investment-actions";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";

export function AddInvestmentDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    
    // Quick validation
    if (!formData.get("name") || !formData.get("quantity")) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
    }

    try {
      const res = await createInvestment(formData);
      if (res.success) {
        toast.success("Asset added to portfolio!");
        setOpen(false);
      } else {
        toast.error("Failed to add asset");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <GravityModal
      open={open}
      onOpenChange={setOpen}
      title="Add New Asset"
      description="Enter the details of your investment to track it in your portfolio."
      trigger={<Button><Plus className="mr-2 h-4 w-4" /> Add Asset</Button>}
    >
      <form onSubmit={onSubmit} className="space-y-4 pt-4">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-2">
                <Label htmlFor="name">Asset Name</Label>
                <Input id="name" name="name" placeholder="e.g. Apple Inc." required />
           </div>
           <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input id="symbol" name="symbol" placeholder="e.g. AAPL" />
           </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select name="type" defaultValue="STOCK">
                <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[200]"> {/* Ensure above modal */}
                    <SelectItem value="STOCK">Stock</SelectItem>
                    <SelectItem value="CRYPTO">Crypto</SelectItem>
                    <SelectItem value="ETF">ETF</SelectItem>
                    <SelectItem value="REAL_ESTATE">Real Estate</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" name="quantity" type="number" step="0.000001" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" name="currency" defaultValue="USD" placeholder="USD" />
            </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="avgCost">Avg Cost (Per Unit)</Label>
                <Input id="avgCost" name="avgCost" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="currentPrice">Current Price (Per Unit)</Label>
                <Input id="currentPrice" name="currentPrice" type="number" step="0.01" placeholder="0.00" required />
            </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add Asset
            </Button>
        </div>
      </form>
    </GravityModal>
  );
}
