"use client";

import { useState, useRef } from "react";
import { GravityModal } from "@/components/ui/gravity-modal";
import { Button } from "@/components/ui/button";
import { Upload, FileUp, Loader2, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkImportTransactions } from "@/app/actions/finance-actions";
import { cn } from "@/lib/utils";

interface ImportDialogProps {
    accounts: any[];
}

export function ImportDialog({ accounts }: ImportDialogProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
    const [previewData, setPreviewData] = useState<string[][]>([]);
    const [mapping, setMapping] = useState({
        date: "",
        description: "",
        amount: "",
    });
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const rows = text.split("\n").map(row => row.split(",")); // Simple CSV splitting, robust parser ideal
            if (rows.length > 0) {
                setCsvHeaders(rows[0]); // Assume header row
                setPreviewData(rows.slice(1, 6)); // Preview 5 rows
                setStep(2);
            }
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (!mapping.date || !mapping.description || !mapping.amount) {
            toast.error("Please map all fields");
            return;
        }
        setLoading(true);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const rows = text.split("\n").slice(1); // Skip headers
            
            const processedData = rows.map(rowStr => {
                const cols = rowStr.split(",");
                if (cols.length < csvHeaders.length) return null;
                
                const dateIdx = csvHeaders.indexOf(mapping.date);
                const descIdx = csvHeaders.indexOf(mapping.description);
                const amtIdx = csvHeaders.indexOf(mapping.amount);
                
                return {
                    date: cols[dateIdx],
                    description: cols[descIdx]?.replace(/"/g, ""),
                    amount: cols[amtIdx]
                };
            }).filter(Boolean);

            const res = await bulkImportTransactions(processedData, selectedAccount);
            if (res.success) {
                toast.success(`Imported ${res.count} transactions`);
                setOpen(false);
                setStep(1);
            } else {
                toast.error("Import failed");
            }
            setLoading(false);
        };
        reader.readAsText(file!);
    };

    return (
        <GravityModal
            open={open}
            onOpenChange={setOpen}
            title="Import Transactions"
            description="Upload a CSV file from your bank."
            trigger={<Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>}
        >
            <div className="space-y-4 pt-4">
                {step === 1 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Select Account</Label>
                            <Select onValueChange={setSelectedAccount} value={selectedAccount}>
                                <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
                                <SelectContent className="z-[200]">
                                    {accounts.map(acc => (
                                        <SelectItem key={acc._id} value={acc._id}>{acc.name} ({acc.currency})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors">
                            <FileUp className="h-10 w-10 text-muted-foreground mb-4" />
                            <Input 
                                type="file" 
                                className="hidden" 
                                id="csv-upload" 
                                accept=".csv"
                                onChange={handleFileChange}
                                disabled={!selectedAccount}
                            />
                            <Label 
                                htmlFor="csv-upload" 
                                className={cn(
                                    "cursor-pointer text-sm font-medium hover:underline",
                                    !selectedAccount && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {selectedAccount ? "Click to upload or drag & drop CSV" : "Select an account first"}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-2">Max 5MB</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                             <div><Label>Date Column</Label></div>
                             <Select onValueChange={(v) => setMapping(p => ({ ...p, date: v }))}>
                                 <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                 <SelectContent>
                                     {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                 </SelectContent>
                             </Select>

                             <div><Label>Description Column</Label></div>
                             <Select onValueChange={(v) => setMapping(p => ({ ...p, description: v }))}>
                                 <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                 <SelectContent>
                                     {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                 </SelectContent>
                             </Select>

                             <div><Label>Amount Column</Label></div>
                             <Select onValueChange={(v) => setMapping(p => ({ ...p, amount: v }))}>
                                 <SelectTrigger><SelectValue placeholder="Select column" /></SelectTrigger>
                                 <SelectContent>
                                      {csvHeaders.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                                 </SelectContent>
                             </Select>
                        </div>
                        
                        <div className="bg-muted p-3 rounded-md text-xs font-mono overflow-x-auto">
                            <p className="mb-2 font-bold text-muted-foreground">Preview (First 3 rows):</p>
                            {previewData.slice(0, 3).map((row, i) => (
                                <div key={i} className="flex gap-2 border-b last:border-0 py-1">
                                    {row.map((cell, j) => (
                                        <span key={j} className={cn("truncate w-24", 
                                            csvHeaders[j] === mapping.date && "text-blue-500",
                                            csvHeaders[j] === mapping.description && "text-purple-500",
                                            csvHeaders[j] === mapping.amount && "text-green-500",
                                        )}>{cell}</span>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                             <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                             <Button onClick={handleImport} disabled={loading}>
                                 {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Check className="mr-2 h-4 w-4"/>}
                                 Confirm Import
                             </Button>
                        </div>
                    </div>
                )}
            </div>
        </GravityModal>
    );
}
