"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { TagsInput } from "@/components/ui/tags-input";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2 } from "lucide-react";
import { MinimalTiptapEditor } from "@/components/ui/minimal-tiptap/editor";
import { cn } from "@/lib/utils";
import { CharacterProgress } from "@/components/ui/character-progress";
import { AlertCircle } from "lucide-react";
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
    title: z.string().min(2, "Title is required"),
    slug: z.string().optional(),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(50, "Content must be at least 50 characters"),
    tags: z.array(z.string()),
    demoUrl: z.string().url().optional().or(z.literal("")),
    repoUrl: z.string().url().optional().or(z.literal("")),
    images: z.array(z.string()),
    featured: z.boolean(),
    published: z.boolean(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export default function EditProjectPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
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

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await fetch(`/api/projects/${params.id}`);
                if (!res.ok) throw new Error("Failed to load project");
                const data = await res.json();

                // Handle backward compatibility: if images is empty but coverImage exists
                let images = data.images || [];
                if (images.length === 0 && data.coverImage) {
                    images = [data.coverImage];
                }

                form.reset({
                    title: data.title,
                    slug: data.slug,
                    excerpt: data.excerpt,
                    content: data.content,
                    tags: data.tags || [],
                    demoUrl: data.demoUrl || "",
                    repoUrl: data.repoUrl || "",
                    images: images,
                    featured: data.featured || false,
                    published: data.published || false,
                });
            } catch {
                toast.error("Error loading project");
                router.push("/admin/projects");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [params.id, router, form]);


    const onSubmit = async (data: ProjectFormValues) => {
        const toastId = toast.loading("Updating project...");

        try {
            const response = await fetch(`/api/projects/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || "Failed");
            }

            toast.success("Project updated!", { id: toastId });
            router.push("/admin/projects");
            router.refresh();
        } catch (error: any) {
            toast.error("Error", { id: toastId, description: error.message });
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit Project</h2>
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
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Project Name" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
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
                                            <FormMessage className="text-red-500" />
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
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Demo URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://..." {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="repoUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Repository URL</FormLabel>
                                            <FormControl>
                                                <Input placeholder="https://github.com/..." {...field} />
                                            </FormControl>
                                            <FormMessage className="text-red-500" />
                                        </FormItem>
                                    )}
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
                                            <FormMessage className="text-red-500" />
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
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Excerpt (Short Description)</FormLabel>
                                        <FormControl>
                                            <SmartTextarea
                                                {...field}
                                                rows={3}
                                                disableAiButton={!form.watch("title")}
                                                context={{
                                                    title: form.watch("title"),
                                                    tags: form.watch("tags"),
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
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
                            {form.formState.isSubmitting ? "Updating..." : "Update Project"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
