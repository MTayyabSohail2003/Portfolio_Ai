
"use client"

import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import getCroppedImg from '@/lib/utils/image-processing'
import { Loader2, Upload, ZoomIn, ZoomOut } from 'lucide-react'

interface ImageUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageCropped: (croppedImage: Blob) => void
}

export function ImageUploadDialog({ open, onOpenChange, onImageCropped }: ImageUploadDialogProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      const imageDataUrl = await readFile(file)
      setImageSrc(imageDataUrl as string)
    }
  }

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => resolve(reader.result), false)
      reader.readAsDataURL(file)
    })
  }

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    setLoading(true)
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
      if (croppedImage) {
        // Convert blob URL to Blob for upload
        const response = await fetch(croppedImage)
        const blob = await response.blob()
        onImageCropped(blob)
        onOpenChange(false)
        setImageSrc(null) // Reset
        setZoom(1)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
        </DialogHeader>
        
        {!imageSrc ? (
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl bg-muted/30">
             <Upload className="w-12 h-12 text-muted-foreground mb-4" />
             <p className="text-sm text-muted-foreground mb-4">Click to upload or drag and drop</p>
             <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
             <Button variant="secondary">Select Image</Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative h-[300px] w-full bg-black rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <ZoomOut className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(val) => setZoom(val[0])}
                className="flex-1"
              />
              <ZoomIn className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}

        <DialogFooter>
           <Button variant="outline" onClick={() => { setImageSrc(null); onOpenChange(false); }}>Cancel</Button>
           <Button onClick={handleSave} disabled={!imageSrc || loading}>
             {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
             Save Changes
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
