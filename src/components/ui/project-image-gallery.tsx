"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectImageGalleryProps {
    images: string[];
    title: string;
}

export function ProjectImageGallery({ images, title }: ProjectImageGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const handlePrevious = () => {
        setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleNext = () => {
        setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div className="space-y-4">
            {/* Main Display Image */}
            <div className="relative rounded-xl overflow-hidden border shadow-sm aspect-video bg-muted group">
                <img
                    src={images[selectedIndex]}
                    alt={`${title} - Image ${selectedIndex + 1}`}
                    className="object-cover w-full h-full transition-all duration-300"
                />

                {/* Navigation Arrows (only if more than 1 image) */}
                {images.length > 1 && (
                    <>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handlePrevious}
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={handleNext}
                            className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-3 py-1 rounded-full">
                        {selectedIndex + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail Strip (only if more than 1 image) */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                                "flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all hover:opacity-100",
                                selectedIndex === idx
                                    ? "border-primary ring-2 ring-primary/30 opacity-100"
                                    : "border-transparent opacity-60 hover:border-muted-foreground/30"
                            )}
                        >
                            <img
                                src={img}
                                alt={`${title} - Thumbnail ${idx + 1}`}
                                className="object-cover w-full h-full"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
