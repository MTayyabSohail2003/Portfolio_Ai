import * as React from "react"
import { type Editor } from "@tiptap/react"
import { Link as LinkIcon, Unlink } from "lucide-react"
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

interface LinkDialogProps {
    editor: Editor
}

export function LinkDialog({ editor }: LinkDialogProps) {
    const [open, setOpen] = React.useState(false)
    const [url, setUrl] = React.useState("")

    const isActive = editor.isActive("link")

    React.useEffect(() => {
        if (open) {
            setUrl(editor.getAttributes("link").href || "")
        }
    }, [open, editor])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run()
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
        }
        setOpen(false)
    }

    const removeLink = () => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run()
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Toggle
                    size="sm"
                    pressed={isActive}
                    aria-label="Toggle link"
                >
                    <LinkIcon className="h-4 w-4" />
                </Toggle>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Link</DialogTitle>
                    <DialogDescription>
                        Enter the URL for the link.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid flex-1 gap-2">
                        <Label htmlFor="link-url" className="sr-only">
                            Link URL
                        </Label>
                        <Input
                            id="link-url"
                            defaultValue={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            aria-label="Link URL"
                        />
                    </div>
                    <DialogFooter className="sm:justify-between">
                        {isActive && (
                            <Button type="button" variant="destructive" size="sm" onClick={removeLink}>
                                <Unlink className="mr-2 h-4 w-4" />
                                Remove Link
                            </Button>
                        )}
                        <div className="flex gap-2">
                            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save</Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
