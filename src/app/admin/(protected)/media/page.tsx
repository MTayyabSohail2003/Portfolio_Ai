"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Copy, Image as ImageIcon, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

export default function MediaLibraryPage() {
  const [images, setImages] = useState<CloudinaryResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (Array.isArray(data)) {
         setImages(data);
      }
    } catch (error) {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading("Uploading...");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      toast.success("Uploaded!", { id: toastId });
      fetchImages();
      e.target.value = ""; // Reset input
    } catch (error: any) {
      toast.error(error.message || "Failed to upload", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Media Library</h2>
            <p className="text-muted-foreground">Manage your portfolio assets.</p>
        </div>
        <div>
             <Input 
                type="file" 
                id="upload-btn" 
                className="hidden" 
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
             />
             <Label htmlFor="upload-btn">
                <Button asChild disabled={uploading} className="cursor-pointer">
                    <span>
                        <Upload className="mr-2 h-4 w-4" /> 
                        {uploading ? "Uploading..." : "Upload Image"}
                    </span>
                </Button>
             </Label>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
            {loading ? <p>Loading...</p> : (
                <>
                    {images.length === 0 ? (
                         <div className="text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No images found. Upload your first one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {images.map((img) => (
                                <div key={img.public_id} className="relative group border rounded-lg overflow-hidden aspect-square bg-muted/20">
                                    <Image 
                                        src={img.secure_url} 
                                        alt={img.public_id} 
                                        fill 
                                        className="object-cover transition-transform group-hover:scale-105"
                                        sizes="(max-width: 768px) 50vw, 20vw"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            onClick={() => copyToClipboard(img.secure_url, img.public_id)}
                                            className="h-8 w-8"
                                            title="Copy URL"
                                        >
                                            {copiedId === img.public_id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
