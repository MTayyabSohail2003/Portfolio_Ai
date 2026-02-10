"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/ui/tags-input";
import { ImageUpload } from "@/components/ui/image-upload";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { AiBlogGenerator } from "../components/ai-blog-generator";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterProgress } from "@/components/ui/character-progress";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";

const blogSchema = z.object({
    title: z.string()
        .min(2, "Title must be at least 2 characters")
        .max(150, "Title must be less than 150 characters"),
    slug: z.string().max(100, "Slug must be less than 100 characters").optional(),
    excerpt: z.string()
        .min(10, "Excerpt must be at least 10 characters")
        .max(500, "Excerpt must be less than 500 characters"),
    content: z.string()
        .min(50, "Content must be at least 50 characters")
        .max(50000, "Content must be less than 50000 characters"),
    tags: z.array(z.string()),
    coverImage: z.string().optional(),
    featured: z.boolean(),
    published: z.boolean(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function NewBlogPage() {
    const router = useRouter();

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(blogSchema),
        mode: "onChange", // Enable real-time validation
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            tags: [],
            coverImage: "",
            featured: false,
            published: true,
        },
    });

    const { formState: { errors, dirtyFields, isSubmitted } } = form;

    // Helper to get field validation state
    const getFieldState = (fieldName: keyof BlogFormValues) => {
        const isDirty = dirtyFields[fieldName];
        const hasError = !!errors[fieldName];
        if (!isDirty && !isSubmitted) return "idle";
        if (hasError) return "error";
        return isDirty ? "success" : "idle";
    };

    // Input styling based on validation state
    const getInputClassName = (state: "idle" | "error" | "success") => {
        return cn(
            "transition-all duration-200",
            state === "success" && "border-green-500/50 focus-visible:ring-green-500/20",
            state === "error" && "border-destructive/50 focus-visible:ring-destructive/20"
        );
    };

    const onSubmit = async (data: BlogFormValues) => {
        const toastId = toast.loading("Publishing post...");

        try {
            const response = await fetch("/api/blog", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || "Failed");
            }

            toast.success("Blog post created!", { id: toastId });
            router.push("/admin/blog");
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An error occurred";
            toast.error("Error", { id: toastId, description: message });
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">New Blog Post</h2>
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Content</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => {
                                            const state = getFieldState("title");
                                            const charCount = field.value?.length || 0;
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="flex items-center gap-2">
                                                            Title
                                                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                        </FormLabel>
                                                        <span className={cn(
                                                            "text-xs transition-colors",
                                                            charCount === 0 ? "text-muted-foreground" :
                                                                charCount < 2 ? "text-orange-500" :
                                                                    charCount > 150 ? "text-destructive" : "text-green-500"
                                                        )}>
                                                            {charCount}/150
                                                        </span>
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Enter post title..."
                                                                className={getInputClassName(state)}
                                                                maxLength={150}
                                                                {...field}
                                                            />
                                                            {state === "error" && (
                                                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <CharacterProgress current={charCount} min={2} max={150} />
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="excerpt"
                                        render={({ field }) => {
                                            const state = getFieldState("excerpt");
                                            const charCount = field.value?.length || 0;
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="flex items-center gap-2">
                                                            Excerpt (SEO)
                                                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                        </FormLabel>
                                                        <span className={cn(
                                                            "text-xs transition-colors",
                                                            charCount === 0 ? "text-muted-foreground" :
                                                                charCount < 10 ? "text-orange-500" :
                                                                    charCount > 500 ? "text-destructive" : "text-green-500"
                                                        )}>
                                                            {charCount}/500
                                                        </span>
                                                    </div>
                                                    <FormControl>
                                                        <SmartTextarea
                                                            {...field}
                                                            rows={3}
                                                            className={getInputClassName(state)}
                                                            placeholder="Short summary for preview cards..."
                                                            disableAiButton={!form.watch("title")}
                                                            context={{
                                                                title: form.watch("title"),
                                                                tags: form.watch("tags"),
                                                            }}
                                                        />
                                                    </FormControl>
                                                    <CharacterProgress current={charCount} min={10} max={500} />
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="content"
                                        render={({ field }) => {
                                            const state = getFieldState("content");
                                            const charCount = field.value?.length || 0;
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="flex items-center gap-2">
                                                            Full Article (Markdown)
                                                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                        </FormLabel>
                                                        <div className="flex items-center gap-3">
                                                            <span className={cn(
                                                                "text-xs transition-colors",
                                                                charCount === 0 ? "text-muted-foreground" :
                                                                    charCount < 50 ? "text-orange-500" :
                                                                        charCount > 50000 ? "text-destructive" : "text-green-500"
                                                            )}>
                                                                {charCount.toLocaleString()}/50,000
                                                            </span>
                                                            <AiBlogGenerator
                                                                onGenerate={(text) => field.onChange(text)}
                                                                disabled={!form.watch("title")}
                                                                context={{
                                                                    title: form.watch("title"),
                                                                    description: form.watch("excerpt"),
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <FormControl>
                                                        <MarkdownEditor
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Write your masterpiece..."
                                                        />
                                                    </FormControl>
                                                    <CharacterProgress current={charCount} min={50} max={50000} />
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="slug"
                                        render={({ field }) => {
                                            const state = getFieldState("slug");
                                            return (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Slug
                                                        {state === "success" && field.value && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="auto-generated"
                                                                className={getInputClassName(state)}
                                                                maxLength={100}
                                                                {...field}
                                                            />
                                                            {state === "error" && (
                                                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription>Optional</FormDescription>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="coverImage"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Cover Image</FormLabel>
                                                <FormControl>
                                                    <ImageUpload
                                                        value={field.value || ""}
                                                        onChange={field.onChange}
                                                        onRemove={() => field.onChange("")}
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tags</FormLabel>
                                                <FormControl>
                                                    <TagsInput
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Add tags..."
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="border-t pt-4 mt-4 space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="published"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Published</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="featured"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Featured Post</FormLabel>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                                        {form.formState.isSubmitting ? "Publishing..." : "Publish Post"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
}

