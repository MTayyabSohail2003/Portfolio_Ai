"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateDailyStandup } from "@/app/actions/standup-actions";
import { Loader2, Copy, Coffee } from "lucide-react";
import { toast } from "sonner";

export function StandupModal({ open, onOpenChange, boardId }: any) {
    const [summary, setSummary] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        const res = await generateDailyStandup(boardId);
        setIsLoading(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            setSummary(res.summary || "");
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(summary);
        toast.success("Copied to clipboard");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Coffee className="h-5 w-5 text-orange-500" />
                        Daily Standup
                    </DialogTitle>
                    <DialogDescription>
                        Generate a summary of yesterday's work based on board activity.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {!summary ? (
                         <div className="flex flex-col items-center justify-center p-8 bg-muted/20 rounded-lg text-center space-y-4">
                            <p className="text-sm text-muted-foreground">Ready to analyze last 24h activity.</p>
                            <Button onClick={handleGenerate} disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Generate Summary
                            </Button>
                         </div>
                    ) : (
                        <div className="relative bg-muted p-4 rounded-md text-sm whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                            {summary}
                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6" onClick={copyToClipboard}>
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
