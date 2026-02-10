"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

import { TagsInput } from "@/components/ui/tags-input";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap/editor";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";
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

const projectSchema = z.object({
    title: z.string()
        .min(10, "Title must be at least 10 characters")
        .max(100, "Title must be less than 100 characters"),
    slug: z.string().optional(),
    excerpt: z.string()
        .min(10, "Excerpt must be at least 10 characters")
        .max(300, "Excerpt must be less than 300 characters"),
    content: z.string()
        .min(50, "Content must be at least 50 characters")
        .max(10000, "Content must be less than 10000 characters"),
    tags: z.array(z.string()),
    demoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    repoUrl: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
    images: z.array(z.string()),
    featured: z.boolean(),
    published: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProjectPage() {
    const router = useRouter();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        mode: "onChange", // Enable real-time validation
        defaultValues: {
            title: "",
            slug: "",
            excerpt: "",
            content: "",
            tags: [],
            demoUrl: "",
            repoUrl: "",
            images: [],
            featured: false,
            published: false,
        },
    });

    const { formState: { errors, dirtyFields, isSubmitted } } = form;

    // Helper to get field validation state
    const getFieldState = (fieldName: keyof ProjectFormValues) => {
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

    const onSubmit = async (data: ProjectFormValues) => {
        const toastId = toast.loading("Creating project...");

        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || "Failed");
            }

            toast.success("Project created!", { id: toastId });
            router.push("/admin/projects");
            router.refresh();
        } catch (error: any) {
            toast.error("Error", { id: toastId, description: error.message });
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">New Project</h2>
                <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Details</CardTitle>
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
                                                                charCount > 100 ? "text-destructive" : "text-green-500"
                                                    )}>
                                                        {charCount}/100
                                                    </span>
                                                </div>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="Project Name"
                                                            className={getInputClassName(state)}
                                                            maxLength={100}
                                                            {...field}
                                                        />
                                                        {state === "error" && (
                                                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <CharacterProgress current={charCount} min={2} max={100} />
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        );
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="auto-generated" {...field} />
                                            </FormControl>
                                            <FormDescription>Leave empty to auto-generate from title.</FormDescription>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <div className="flex flex-col gap-2 p-3 border rounded-md bg-muted/20">
                                    <FormField
                                        control={form.control}
                                        name="featured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Featured Project</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="published"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-3">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Publish Immediately</FormLabel>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Links & Media</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="demoUrl"
                                    render={({ field }) => {
                                        const state = getFieldState("demoUrl");
                                        return (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    Demo URL
                                                    {state === "success" && field.value && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="https://..."
                                                            className={getInputClassName(state)}
                                                            {...field}
                                                        />
                                                        {state === "error" && (
                                                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        );
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name="repoUrl"
                                    render={({ field }) => {
                                        const state = getFieldState("repoUrl");
                                        return (
                                            <FormItem>
                                                <FormLabel className="flex items-center gap-2">
                                                    Repository URL
                                                    {state === "success" && field.value && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="https://github.com/..."
                                                            className={getInputClassName(state)}
                                                            {...field}
                                                        />
                                                        {state === "error" && (
                                                            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                        )}
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        );
                                    }}
                                />
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2">
                                                Project Images
                                                {field.value.length > 0 && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                            </FormLabel>
                                            <FormDescription className="text-xs">
                                                First image will be used as cover. Drag to reorder.
                                            </FormDescription>
                                            <FormControl>
                                                <MultiImageUpload
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    maxImages={8}
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
                                            <FormLabel>Tags / Technologies</FormLabel>
                                            <FormControl>
                                                <TagsInput
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Enter technologies and press Enter..."
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardContent className="p-6 space-y-4">
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
                                                    Excerpt (Short Description)
                                                    {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                </FormLabel>
                                                <span className={cn(
                                                    "text-xs transition-colors",
                                                    charCount === 0 ? "text-muted-foreground" :
                                                        charCount < 10 ? "text-orange-500" :
                                                            charCount > 300 ? "text-destructive" : "text-green-500"
                                                )}>
                                                    {charCount}/300
                                                </span>
                                            </div>
                                            <FormControl>
                                                <SmartTextarea
                                                    {...field}
                                                    rows={3}
                                                    className={getInputClassName(state)}
                                                    disableAiButton={!form.watch("title")}
                                                    context={{
                                                        title: form.watch("title"),
                                                        tags: form.watch("tags"),
                                                    }}
                                                />
                                            </FormControl>
                                            <CharacterProgress current={charCount} min={10} max={300} />
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
                                                    Case Study Content (Markdown)
                                                    {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                </FormLabel>
                                                <span className={cn(
                                                    "text-xs transition-colors",
                                                    charCount === 0 ? "text-muted-foreground" :
                                                        charCount < 50 ? "text-orange-500" :
                                                            charCount > 10000 ? "text-destructive" : "text-green-500"
                                                )}>
                                                    {charCount}/10000
                                                </span>
                                            </div>
                                            <FormControl>
                                                <MinimalTiptapEditor
                                                    {...field}
                                                    className={cn("min-h-[400px]", getInputClassName(state))}
                                                    placeholder="Detailed case study content..."
                                                    editorClassName="focus:outline-none"
                                                />
                                            </FormControl>
                                            <CharacterProgress current={charCount} min={50} max={10000} />
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    );
                                }}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Creating..." : "Create Project"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
