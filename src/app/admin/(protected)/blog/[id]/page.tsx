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
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
    title: z.string().min(2, "Title is required"),
    slug: z.string().optional(),
    excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
    content: z.string().min(50, "Content must be at least 50 characters"),
    tags: z.array(z.string()),
    coverImage: z.string().optional(),
    featured: z.boolean(),
    published: z.boolean(),
});

type BlogFormValues = z.infer<typeof blogSchema>;

export default function EditBlogPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);

    const form = useForm<BlogFormValues>({
        resolver: zodResolver(blogSchema),
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

    useEffect(() => {
        const fetchBlog = async () => {
            if (!params.id || params.id === "new") return; // Handled by new page if navigated there, but this is [id]

            try {
                const res = await fetch(`/api/blog/${params.id}`);
                if (!res.ok) throw new Error("Failed to load blog");
                const data = await res.json();
                form.reset({
                    title: data.title || "",
                    slug: data.slug || "",
                    excerpt: data.excerpt || "",
                    content: data.content || "",
                    tags: Array.isArray(data.tags) ? data.tags : [],
                    coverImage: data.coverImage || "",
                    featured: data.featured || false,
                    published: data.published || false,
                });
            } catch (error) {
                toast.error("Error loading blog");
                router.push("/admin/blog");
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [params.id, router, form]);

    const onSubmit = async (data: BlogFormValues) => {
        const toastId = toast.loading("Updating post...");

        try {
            const response = await fetch(`/api/blog/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const resData = await response.json();

            if (!response.ok) {
                throw new Error(resData.error || "Failed");
            }

            toast.success("Blog post updated!", { id: toastId });
            router.push("/admin/blog");
            router.refresh();
        } catch (error: any) {
            toast.error("Error", { id: toastId, description: error.message });
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Edit Blog Post</h2>
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
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Enter post title..." {...field} />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="excerpt"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Excerpt (SEO)</FormLabel>
                                                <FormControl>
                                                    <SmartTextarea
                                                        {...field}
                                                        rows={3}
                                                        placeholder="Short summary for preview cards..."
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
                                        render={({ field }) => (
                                            <FormItem>
                                                <div className="flex items-center justify-between">
                                                    <FormLabel>Full Article (Markdown)</FormLabel>
                                                    <AiBlogGenerator
                                                        onGenerate={(text) => field.onChange(text)}
                                                        disabled={!form.watch("title")}
                                                        context={{
                                                            title: form.watch("title"),
                                                            description: form.watch("excerpt"),
                                                        }}
                                                    />
                                                </div>
                                                <FormControl>
                                                    <MarkdownEditor
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Write your masterpiece..."
                                                    />
                                                </FormControl>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
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
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Slug</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="auto-generated" {...field} />
                                                </FormControl>
                                                <FormDescription>Optional</FormDescription>
                                                <FormMessage className="text-red-500" />
                                            </FormItem>
                                        )}
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
                                                <FormMessage className="text-red-500" />
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
                                                <FormMessage className="text-red-500" />
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
                                        {form.formState.isSubmitting ? "Updating..." : "Update Post"}
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
