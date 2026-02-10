import * as React from "react"
import { type Editor } from "@tiptap/react"
import { Image as ImageIcon, Upload, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ImageDialogProps {
    editor: Editor
}

export function ImageDialog({ editor }: ImageDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [url, setUrl] = React.useState("")
    const [file, setFile] = React.useState<File | null>(null)
    const [isUploading, setIsUploading] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState("link")

    const handleLinkSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (url) {
            editor.chain().focus().setImage({ src: url }).run()
            setOpen(false)
            setUrl("")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const res = await fetch("/api/media", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                throw new Error("Upload failed")
            }

            const data = await res.json()
            editor.chain().focus().setImage({ src: data.url }).run()
            setOpen(false)
            setFile(null)
        } catch (error) {
            console.error("Upload error:", error)
            alert("Failed to upload image. Please try again.")
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Toggle
                    size="sm"
                    pressed={false} // Images don't have an active state in the toolbar usually
                    aria-label="Insert image"
                >
                    <ImageIcon className="h-4 w-4" />
                </Toggle>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert Image</DialogTitle>
                    <DialogDescription>
                        Insert an image via URL or upload one from your device.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="link" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="link">Link</TabsTrigger>
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                    </TabsList>
                    <TabsContent value="link">
                        <form onSubmit={handleLinkSubmit} className="flex flex-col gap-4 py-4">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="image-url" className="sr-only">
                                    Image URL
                                </Label>
                                <Input
                                    id="image-url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    aria-label="Image URL"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!url}>Insert Image</Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                    <TabsContent value="upload">
                        <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4 py-4">
                            <div className="grid flex-1 gap-2">
                                <Label htmlFor="image-file" className="sr-only">
                                    Upload File
                                </Label>
                                <Input
                                    id="image-file"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    aria-label="Upload File"
                                    className="cursor-pointer"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={!file || isUploading}>
                                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUploading ? "Uploading..." : "Upload & Insert"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
