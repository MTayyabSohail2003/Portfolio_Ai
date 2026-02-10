"use client";

import * as React from "react";
import { Upload, X, Plus, GripVertical, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MediaPicker } from "@/components/admin/media-picker";
import { cn } from "@/lib/utils";

interface MultiImageUploadProps {
    value: string[];
    onChange: (value: string[]) => void;
    maxImages?: number;
    className?: string;
}

export function MultiImageUpload({
    value = [],
    onChange,
    maxImages = 10,
    className
}: MultiImageUploadProps) {
    const [pickerOpen, setPickerOpen] = React.useState(false);
    const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

    const handleSelect = (url: string) => {
        if (value.length < maxImages) {
            onChange([...value, url]);
        }
    };

    const handleRemove = (index: number) => {
        const newImages = value.filter((_, i) => i !== index);
        onChange(newImages);
    };

    const handleSetAsCover = (index: number) => {
        if (index === 0) return; // Already cover
        const newImages = [...value];
        const selectedImage = newImages.splice(index, 1)[0];
        newImages.unshift(selectedImage); // Move to first position
        onChange(newImages);
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newImages = [...value];
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(index, 0, draggedImage);
        onChange(newImages);
        setDraggedIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <div className={cn("space-y-3", className)}>
            {/* Image Grid */}
            {value.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {value.map((url, index) => (
                        <div
                            key={`${url}-${index}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "relative aspect-video rounded-lg overflow-hidden border bg-muted group cursor-move transition-all",
                                draggedIndex === index && "opacity-50 scale-95",
                                index === 0 && "ring-2 ring-primary ring-offset-2"
                            )}
                        >
                            {/* Drag Handle */}
                            <div className="absolute left-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/60 rounded p-1">
                                    <GripVertical className="h-4 w-4 text-white" />
                                </div>
                            </div>

                            {/* Remove Button */}
                            <Button
                                type="button"
                                onClick={() => handleRemove(index)}
                                variant="destructive"
                                size="icon"
                                className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7"
                            >
                                <X className="h-3 w-3" />
                            </Button>

                            {/* Cover Badge or Set as Cover Button */}
                            {index === 0 ? (
                                <div className="absolute left-2 bottom-2 z-10">
                                    <span className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded flex items-center gap-1">
                                        <Star className="h-3 w-3" fill="currentColor" />
                                        Cover
                                    </span>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={() => handleSetAsCover(index)}
                                    variant="secondary"
                                    size="sm"
                                    className="absolute left-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-[10px] px-2"
                                >
                                    <Star className="h-3 w-3 mr-1" />
                                    Set as cover
                                </Button>
                            )}

                            <img
                                src={url}
                                alt={`Project image ${index + 1}`}
                                className="object-cover w-full h-full"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Add More Button */}
            {value.length < maxImages && (
                <Card
                    className="border-dashed cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setPickerOpen(true)}
                >
                    <CardContent className="flex items-center justify-center py-6 gap-3">
                        <div className="rounded-full bg-muted p-2">
                            {value.length === 0 ? (
                                <Upload className="h-5 w-5 text-muted-foreground" />
                            ) : (
                                <Plus className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                {value.length === 0 ? "Add project images" : "Add more images"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {value.length}/{maxImages} images • Click star to set cover
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            <MediaPicker
                open={pickerOpen}
                onOpenChange={setPickerOpen}
                onSelect={handleSelect}
            />
        </div>
    );
}

