"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Upload, Image as ImageIcon, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MediaPickerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (url: string) => void;
}

export function MediaPicker({ open, onOpenChange, onSelect }: MediaPickerProps) {
    const [activeTab, setActiveTab] = useState("upload");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 z-[100]">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle>Media Library</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                        <div className="px-6 py-2 border-b bg-muted/30">
                            <TabsList className="grid w-full max-w-md grid-cols-2">
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                <TabsTrigger value="library">Library</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="flex-1 overflow-hidden bg-background">
                            <TabsContent value="upload" className="h-full m-0 p-6">
                                <UploadTab onSelect={(url) => {
                                    onSelect(url);
                                    onOpenChange(false);
                                }} />
                            </TabsContent>
                            
                            <TabsContent value="library" className="h-full m-0 p-0">
                                <LibraryTab onSelect={(url) => {
                                    onSelect(url);
                                    onOpenChange(false);
                                }} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function UploadTab({ onSelect }: { onSelect: (url: string) => void }) {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large (max 5MB)");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/media", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            onSelect(data.url);
            toast.success("Uploaded successfully");
        } catch (error) {
            toast.error("Failed to upload");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
            <div className="p-4 rounded-full bg-background mb-4 shadow-sm">
                 {uploading ? <Loader2 className="h-8 w-8 animate-spin text-primary" /> : <Upload className="h-8 w-8 text-primary" />}
            </div>
            <h3 className="text-lg font-semibold mb-1">
                {uploading ? "Uploading..." : "Upload New Image"}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
                Drag & drop or Click to browse
            </p>
            <Input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                id="media-picker-upload"
                onChange={handleFileChange}
                disabled={uploading}
            />
            <Button onClick={() => document.getElementById("media-picker-upload")?.click()} disabled={uploading}>
                Select File
            </Button>
        </div>
    );
}

function LibraryTab({ onSelect }: { onSelect: (url: string) => void }) {
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);

    const fetchImages = useCallback(async (cursor?: string) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (cursor) params.append("cursor", cursor);
            
            const res = await fetch(`/api/media?${params.toString()}`);
            const data = await res.json();
            
            if (res.ok) {
                setImages(prev => cursor ? [...prev, ...data.resources] : data.resources);
                setNextCursor(data.next_cursor || null);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setInitialized(true);
        }
    }, []);

    useEffect(() => {
        if (!initialized) fetchImages();
    }, [initialized, fetchImages]);

    const handleDelete = async (publicId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this image?")) return;

        try {
            const res = await fetch(`/api/media?public_id=${publicId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Image deleted");
                setImages(prev => prev.filter(img => img.public_id !== publicId));
            } else {
                toast.error("Failed to delete image");
            }
        } catch (error) {
            toast.error("Error deleting image");
        }
    };

    return (
        <div className="h-full flex flex-col">
            <ScrollArea className="flex-1 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-4">
                    {images.map((img) => (
                        <div 
                            key={img.public_id} 
                            className="group relative aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer border hover:border-primary transition-all"
                            onClick={() => onSelect(img.secure_url)}
                        >
                            <img 
                                src={img.secure_url} 
                                alt="Library" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <CheckCircle className="text-white w-8 h-8" />
                                <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="absolute top-2 right-2 h-8 w-8"
                                    onClick={(e) => handleDelete(img.public_id, e)}
                                >
                                    <div className="h-4 w-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                    </div>
                                </Button>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={`skel-${i}`} className="aspect-square bg-muted animate-pulse rounded-lg" />
                        ))
                    )}
                </div>
                
                {nextCursor && !loading && (
                    <div className="flex justify-center p-4">
                        <Button variant="ghost" onClick={() => fetchImages(nextCursor)}>
                            Load More
                        </Button>
                    </div>
                )}
                
                {!loading && images.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                        <p>No images found</p>
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
