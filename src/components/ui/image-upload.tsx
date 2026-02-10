import * as React from "react"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MediaPicker } from "@/components/admin/media-picker"

interface ImageUploadProps {
  value?: string
  onChange: (value: string) => void
  onRemove: () => void
}

export function ImageUpload({ value, onChange, onRemove }: ImageUploadProps) {
  const [preview, setPreview] = React.useState<string | undefined>(value)
  const [pickerOpen, setPickerOpen] = React.useState(false)

  React.useEffect(() => {
    setPreview(value)
  }, [value])

  const handleSelect = (url: string) => {
    setPreview(url)
    onChange(url)
  }

  if (preview) {
    return (
      <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border bg-muted group">
        <Button
          type="button"
          onClick={() => {
            onRemove()
            setPreview(undefined)
          }}
          variant="destructive"
          size="icon"
          className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </Button>
        <img
          src={preview}
          alt="Upload preview"
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <Button variant="secondary" size="sm" onClick={() => setPickerOpen(true)}>
                Change Image
             </Button>
        </div>
        <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleSelect} />
      </div>
    )
  }

  return (
    <>
        <Card className="max-w-sm border-dashed cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setPickerOpen(true)}>
            <CardContent className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="rounded-full bg-muted p-4">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-sm font-medium">Click to upload or select image</p>
                    <p className="text-xs text-muted-foreground">Library, Google Photos, or Device</p>
                </div>
                <Button type="button" variant="ghost" size="sm">Select Image</Button>
            </CardContent>
        </Card>
        <MediaPicker open={pickerOpen} onOpenChange={setPickerOpen} onSelect={handleSelect} />
    </>
  )
}
