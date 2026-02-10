"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have this, or fallback to simple textarea
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function BulkTaskDialog({ open, onOpenChange, boardId }: any) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const router = useRouter();

    const handleProcess = async () => {
        if (!input.trim()) return;
        setIsLoading(true);
        setResult(null);

        try {
            const res = await fetch("/api/agent/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: input, boardId })
            });
            const data = await res.json();

            if (data.error) {
                toast.error(data.error);
            } else if (data.success) {
                setResult(data);
                toast.success(`Created ${data.count} tasks successfully!`);
                setInput("");
                router.refresh();
            } else {
                 toast.warning(data.message);
            }
        } catch (e) {
            toast.error("Failed to connect to agent.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        AI Bulk Task Creator
                    </DialogTitle>
                    <DialogDescription>
                        Paste unstructured text (e.g., meeting notes, brainstorming list) and let the Agent format and create tasks for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {!result ? (
                        <Textarea 
                            placeholder="e.g. We need to fix the login bug on iOS, update the header logo, and check the database performance..."
                            className="min-h-[200px] font-mono text-sm leading-relaxed"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    ) : (
                        <div className="min-h-[200px] flex flex-col items-center justify-center space-y-4 bg-muted/20 rounded-lg p-6">
                             <CheckCircle2 className="h-12 w-12 text-green-500" />
                             <div className="text-center space-y-1">
                                <h3 className="font-semibold text-lg">Success!</h3>
                                <p className="text-muted-foreground text-sm">Created {result.count} tasks.</p>
                             </div>
                             <div className="w-full text-xs text-muted-foreground bg-muted p-2 rounded">
                                {result.tasks?.map((t: any, i: number) => (
                                    <div key={i} className="truncate">• {t.title} <span className="opacity-50">({t.priority})</span></div>
                                ))}
                             </div>
                             <Button variant="outline" onClick={() => setResult(null)}>Create More</Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {!result && (
                         <Button onClick={handleProcess} disabled={isLoading || !input.trim()} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white">
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Processing with AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Magic Add
                                </>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
