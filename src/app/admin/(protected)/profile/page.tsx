"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadDialog } from "@/components/profile/image-upload-dialog";
import { uploadProfileImage } from "@/app/actions/upload-actions";
import { toast } from "sonner";
import { Camera, User as UserIcon } from "lucide-react";
import { useSession } from "@/lib/auth-client";

export default function ProfilePage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const { data: session } = useSession(); 
    const userImage = session?.user?.image;

    const handleImageCropped = async (blob: Blob) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", blob, "profile.jpg");

        const result = await uploadProfileImage(formData);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Profile picture updated!");
            window.location.reload();
        }
        setUploading(false);
    };

    return (
        <div className="space-y-6 pt-6">
            <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your public profile details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                             <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-muted-foreground/20">
                                {userImage ? (
                                    <img src={userImage} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                                )}
                             </div>
                             <button 
                                onClick={() => setIsDialogOpen(true)}
                                className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                             >
                                 <Camera className="h-6 w-6 text-white" />
                             </button>
                        </div>
                        <div>
                             <h3 className="font-medium text-lg">{session?.user?.name || "User"}</h3>
                             <p className="text-sm text-muted-foreground">{session?.user?.email || "email@example.com"}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                 <Card>
                    <CardHeader>
                        <CardTitle>Bio & Details</CardTitle>
                        <CardDescription>Tell the world about yourself.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Short Bio</label>
                             <textarea 
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="I am a software engineer..."
                             />
                        </div>
                         <Button variant="outline" className="w-full">Save Details</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Social Links</CardTitle>
                        <CardDescription>Connect your profiles.</CardDescription>
                    </CardHeader>
                     <CardContent className="space-y-4">
                         <div className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-20 text-sm">GitHub</span>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="https://github.com/..." />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-20 text-sm">LinkedIn</span>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="https://linkedin.com/in/..." />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-20 text-sm">Twitter</span>
                                <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="https://twitter.com/..." />
                            </div>
                         </div>
                         <Button variant="outline" className="w-full mt-4">Update Links</Button>
                     </CardContent>
                </Card>
            </div>

            <ImageUploadDialog 
                open={isDialogOpen} 
                onOpenChange={setIsDialogOpen} 
                onImageCropped={handleImageCropped} 
            />
        </div>
    );
}
