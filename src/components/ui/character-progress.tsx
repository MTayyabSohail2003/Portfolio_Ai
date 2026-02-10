"use client";

import { cn } from "@/lib/utils";

interface CharacterProgressProps {
    current: number;
    min: number;
    max: number;
    className?: string;
}

export function CharacterProgress({ current, min, max, className }: CharacterProgressProps) {
    const percentage = Math.min((current / max) * 100, 100);

    // Determine color based on validation state
    const getProgressColor = () => {
        if (current === 0) return "bg-muted-foreground/30";
        if (current < min) return "bg-orange-500";
        if (current > max) return "bg-destructive";
        return "bg-green-500";
    };

    return (
        <div className={cn("h-1 w-full bg-muted/50 rounded-full overflow-hidden mt-1.5", className)}>
            <div
                className={cn(
                    "h-full rounded-full transition-all duration-300 ease-out",
                    getProgressColor()
                )}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}
