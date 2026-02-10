"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, RefreshCw, Database, FileText, Trash2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function RagManagementPage() {
  const [indexing, setIndexing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchStats = async () => {
      try {
          const res = await fetch("/api/rag/stats");
          if (res.ok) {
              const data = await res.json();
              setStats(data);
          }
      } catch (e) {
          console.error("Failed to fetch rag stats");
      }
  };

  useEffect(() => {
      fetchStats();
  }, []);

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
        toast.error("Please select a file first.");
        return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading...");
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("/api/rag/upload", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Upload failed");
        }

        toast.success(`Document uploaded and embedded successfully! ID: ${data.id}`, { id: toastId });
        if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error: any) {
        console.error(error);
        toast.error(error.message, { id: toastId });
    } finally {
        setUploading(false);
    }
  };

  const handleReIndex = async () => {
    setIndexing(true);
    const toastId = toast.loading("Syncing RAG content...");
    try {
        const res = await fetch("/api/rag/sync", { method: "POST" });
        const data = await res.json();
        
        if (res.ok) {
            toast.success(data.message, { id: toastId });
            fetchStats();
        } else {
            toast.error(`Error: ${data.error}`, { id: toastId });
        }
    } catch (e: any) {
        toast.error(`Failed to sync: ${e.message}`, { id: toastId });
    } finally {
        setIndexing(false);
    }
  };

  const handleResetIndex = async () => {
      const toastId = toast.loading("Reseting index...");
      try {
          const res = await fetch("/api/rag/reset", { method: "POST" });
          const data = await res.json();
           if (res.ok) {
              toast.success(data.message, { id: toastId });
              fetchStats();
          } else {
              toast.error(`Error: ${data.error}`, { id: toastId });
          }
      } catch (e: any) {
          toast.error(`Failed to reset: ${e.message}`, { id: toastId });
      }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">RAG Knowledge Base</h2>
        <p className="text-muted-foreground">Manage the context available to the AI Agent.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Upload className="w-5 h-5"/> Upload Documents</CardTitle>
                <CardDescription>Upload TXT/MD files to be parsed and embedded.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="document">Document</Label>
                    <Input id="document" type="file" accept=".txt,.md,.json" ref={fileInputRef} />
                </div>
                <Button className="w-full" onClick={handleUpload} disabled={uploading}>
                    {uploading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload & Embed"}
                </Button>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5"/> Vector Index Status</CardTitle>
                <CardDescription>Pinecone Index: <strong>{process.env.NEXT_PUBLIC_PINECONE_INDEX || "portfolio"}</strong></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg text-sm">
                    <span>Total Vectors</span>
                    <span className="font-mono font-bold">{stats?.totalRecordCount ?? "--"}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg text-sm">
                    <span>Last Updated</span>
                    <span className="font-mono">Just now</span>
                </div>
                <Button variant="outline" className="w-full" onClick={handleReIndex} disabled={indexing}>
                    {indexing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    {indexing ? "Re-indexing..." : "Trigger Full Re-Index"}
                </Button>

                <div className="pt-4 border-t mt-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="destructive" className="w-full">
                                <Trash2 className="mr-2 h-4 w-4" /> Reset Index (Delete All)
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete all vectors from the Pinecone index.
                                    The AI agent will have no context until you re-index.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 mt-4">
                                <Button variant="ghost" onClick={(e) => {
                                }}>Cancel</Button>
                                <Button variant="destructive" onClick={handleResetIndex}>
                                    Confirm Reset
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

