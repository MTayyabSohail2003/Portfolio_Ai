"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger as TabTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AiBlogGeneratorProps {
  onGenerate: (content: string) => void;
  context?: {
    title?: string;
    description?: string;
  };
  disabled?: boolean;
}

export function AiBlogGenerator({ onGenerate, context, disabled }: AiBlogGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Configuration State
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState([1000]); // Words approx
  const [format, setFormat] = useState("markdown");
  const [prompt, setPrompt] = useState("");

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please provide some context or instructions");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          context: {
            ...context,
            type: "blog_post",
            config: {
              tone,
              length: length[0],
              format,
            },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Generation failed");

      onGenerate(data.text);
      toast.success("Content generated successfully!");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to generate content");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          title={disabled ? "Please enter a title first" : "Generate with AI"}
          className={cn(
            "gap-2 text-indigo-500 border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-indigo-900 dark:hover:bg-indigo-950/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <Sparkles className="h-4 w-4" />
          Generate with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] z-[80]"> {/* z-80 to be above existing overlays if any */}
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            AI Blog Assistant
          </DialogTitle>
          <DialogDescription>
            Configure the AI to write a perfect draft for you.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">

          {/* Tone Selection */}
          <div className="space-y-2">
            <Label>Tone of Voice</Label>
            <Tabs value={tone} onValueChange={setTone} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabTrigger value="professional">Pro</TabTrigger>
                <TabTrigger value="casual">Casual</TabTrigger>
                <TabTrigger value="technical">Tech</TabTrigger>
                <TabTrigger value="storytelling">Story</TabTrigger>
                <TabTrigger value="controversial">Bold</TabTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="z-[90]">
                  <SelectItem value="markdown">Standard Article</SelectItem>
                  <SelectItem value="listicle">Listicle (Top X)</SelectItem>
                  <SelectItem value="tutorial">Technical Tutorial</SelectItem>
                  <SelectItem value="case_study">Case Study</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Length Selection */}
            <div className="space-y-2">
              <Label>Target Length: ~{length[0]} words</Label>
              <Slider
                value={length}
                onValueChange={setLength}
                max={2000}
                min={300}
                step={100}
                className="py-4"
              />
            </div>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label>Context & Instructions</Label>
            <SmartTextarea
              placeholder="Describe what this article is about. Include key points, quotes, or specific sections you want included..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground">
              Tip: Be specific about the "Why" and "How" for better results.
            </p>
          </div>

        </div>

        <DialogFooter>
          <div className="flex w-full justify-between items-center sm:justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleGenerate} disabled={loading || !prompt} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Draft
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
