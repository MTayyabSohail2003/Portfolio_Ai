"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SmartTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onGenerated?: (text: string) => void;
  context?: Record<string, any>;
  enableAi?: boolean;
  disableAiButton?: boolean;
}

export function SmartTextarea({
  className,
  onGenerated,
  context,
  enableAi = true,
  disableAiButton = false,
  ...props
}: SmartTextareaProps) {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!context || Object.keys(context).length === 0) {
      toast.error("Please fill in other fields to provide context for AI.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Generate a professional description/content based on this context.",
          context,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      const data = await res.json();
      if (onGenerated) {
        onGenerated(data.text);
        toast.success("Content generated!");
      }
    } catch (error) {
      toast.error("Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <Textarea
        className={cn("min-h-[150px] pr-10", className)}
        {...props}
      />
      {enableAi && (
        <div className="absolute top-2 right-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleGenerate}
            disabled={loading || disableAiButton}
            title={disableAiButton ? "Please fill in title/position first" : "Generate with AI"}
            className={cn(
              "h-8 w-8 transition-colors",
              disableAiButton ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/10 hover:text-primary"
            )}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}
