import * as React from "react"
import { type Editor } from "@tiptap/react"
import { Youtube } from "lucide-react"
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

interface YoutubeDialogProps {
    editor: Editor
}

export function YoutubeDialog({ editor }: YoutubeDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [url, setUrl] = React.useState("")

    const isActive = editor.isActive("youtube")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (url) {
            editor.commands.setYoutubeVideo({ src: url })
            setOpen(false)
            setUrl("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Toggle
                    size="sm"
                    pressed={isActive}
                    aria-label="Insert YouTube video"
                >
                    <Youtube className="h-4 w-4" />
                </Toggle>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Insert YouTube Video</DialogTitle>
                    <DialogDescription>
                        Enter the URL of the YouTube video.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="youtube-url" className="sr-only">
                            YouTube URL
                        </Label>
                        <Input
                            id="youtube-url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://youtube.com/watch?v=..."
                            aria-label="YouTube URL"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!url}>Insert Video</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
