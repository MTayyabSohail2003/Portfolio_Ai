"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Star, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

const skillSchema = z.object({
    name: z.string()
        .min(2, "Skill name must be at least 2 characters")
        .max(50, "Skill name must be less than 50 characters"),
    category: z.string()
        .min(2, "Category must be at least 2 characters")
        .max(50, "Category must be less than 50 characters"),
    proficiency: z.number().min(0).max(100),
    icon: z.string().max(200, "Icon must be less than 200 characters").optional(),
    featured: z.boolean(),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface Skill extends SkillFormValues {
    _id: string;
}

export default function SkillsManagerPage() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [loading, setLoading] = useState(true);
    const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

    const form = useForm<SkillFormValues>({
        resolver: zodResolver(skillSchema),
        mode: "onChange", // Enable real-time validation
        defaultValues: {
            name: "",
            category: "",
            proficiency: 50,
            icon: "",
            featured: false,
        },
    });

    const { formState: { errors, dirtyFields, isSubmitted } } = form;

    // Helper to get field validation state
    const getFieldState = (fieldName: keyof SkillFormValues) => {
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

    const fetchSkills = async () => {
        try {
            const res = await fetch("/api/skills");
            const data = await res.json();
            setSkills(data);
        } catch (error) {
            toast.error("Failed to load skills");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const onSubmit = async (data: SkillFormValues) => {
        const toastId = toast.loading("Adding skill...");
        try {
            const res = await fetch("/api/skills", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed");

            toast.success("Skill added!", { id: toastId });
            form.reset();
            fetchSkills();
        } catch (error) {
            toast.error("Failed to add skill", { id: toastId });
        }
    };

    const confirmDelete = async () => {
        if (!skillToDelete) return;
        try {
            await fetch(`/api/skills/${skillToDelete}`, { method: "DELETE" });
            toast.success("Deleted");
            setSkills(skills.filter((s) => s._id !== skillToDelete));
        } catch (error) {
            toast.error("Failed to delete");
        } finally {
            setSkillToDelete(null);
        }
    };

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-10">
            <ConfirmModal
                isOpen={!!skillToDelete}
                onClose={() => setSkillToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Skill"
                description="Are you sure you want to delete this skill?"
            />
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-bold tracking-tight">Skills Manager</h2>
                <p className="text-muted-foreground">Manage your technical expertise and proficiency levels.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Form Section */}
                <div className="lg:col-span-5">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add New</CardTitle>
                            <CardDescription>Add a new skill to your portfolio.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => {
                                            const state = getFieldState("name");
                                            const charCount = field.value?.length || 0;
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="flex items-center gap-2">
                                                            Skill Name
                                                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                        </FormLabel>
                                                        <span className={cn(
                                                            "text-xs transition-colors",
                                                            charCount === 0 ? "text-muted-foreground" :
                                                                charCount < 2 ? "text-orange-500" :
                                                                    charCount > 50 ? "text-destructive" : "text-green-500"
                                                        )}>
                                                            {charCount}/50
                                                        </span>
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="e.g. React.js"
                                                                className={getInputClassName(state)}
                                                                maxLength={50}
                                                                {...field}
                                                            />
                                                            {state === "error" && (
                                                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <CharacterProgress current={charCount} min={2} max={50} />
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => {
                                            const state = getFieldState("category");
                                            const charCount = field.value?.length || 0;
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="flex items-center gap-2">
                                                            Category
                                                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                        </FormLabel>
                                                        <span className={cn(
                                                            "text-xs transition-colors",
                                                            charCount === 0 ? "text-muted-foreground" :
                                                                charCount < 2 ? "text-orange-500" :
                                                                    charCount > 50 ? "text-destructive" : "text-green-500"
                                                        )}>
                                                            {charCount}/50
                                                        </span>
                                                    </div>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="e.g. Frontend"
                                                                className={getInputClassName(state)}
                                                                maxLength={50}
                                                                {...field}
                                                            />
                                                            {state === "error" && (
                                                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <CharacterProgress current={charCount} min={2} max={50} />
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="proficiency"
                                        render={({ field }) => {
                                            const profValue = field.value || 0;
                                            return (
                                                <FormItem>
                                                    <div className="flex items-center justify-between">
                                                        <FormLabel className="flex items-center gap-2">
                                                            Proficiency
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                                        </FormLabel>
                                                        <span className={cn(
                                                            "text-sm font-medium transition-colors",
                                                            profValue < 30 ? "text-orange-500" :
                                                                profValue < 70 ? "text-yellow-500" : "text-green-500"
                                                        )}>
                                                            {profValue}%
                                                        </span>
                                                    </div>
                                                    <FormControl>
                                                        <Slider
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            defaultValue={[field.value]}
                                                            onValueChange={(vals) => field.onChange(vals[0])}
                                                            className={cn(
                                                                "[&_[role=slider]]:transition-colors",
                                                                profValue < 30 && "[&_[role=slider]]:bg-orange-500",
                                                                profValue >= 30 && profValue < 70 && "[&_[role=slider]]:bg-yellow-500",
                                                                profValue >= 70 && "[&_[role=slider]]:bg-green-500"
                                                            )}
                                                        />
                                                    </FormControl>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="icon"
                                        render={({ field }) => {
                                            const state = getFieldState("icon");
                                            return (
                                                <FormItem>
                                                    <FormLabel className="flex items-center gap-2">
                                                        Icon (Optional)
                                                        {state === "success" && field.value && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                                    </FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="Lucide Icon Name or URL"
                                                                className={getInputClassName(state)}
                                                                maxLength={200}
                                                                {...field}
                                                            />
                                                            {state === "error" && (
                                                                <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                                                            )}
                                                        </div>
                                                    </FormControl>
                                                    <FormDescription className="text-xs">e.g. &quot;Code2&quot; or &quot;https://...&quot;</FormDescription>
                                                    <FormMessage className="text-xs" />
                                                </FormItem>
                                            );
                                        }}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="featured"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-2 border rounded-md">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Featured Skill</FormLabel>
                                                    <FormDescription>Show on Home Page</FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Skill"}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>

                {/* List Section */}
                <div className="lg:col-span-7">
                    <Card className="h-full flex flex-col">
                        <CardHeader>
                            <CardTitle>Skill Library</CardTitle>
                            <CardDescription>
                                Total Skills: {skills.length}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden p-0">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <ScrollArea className="h-[600px] px-6 pb-6">
                                    <div className="space-y-3">
                                        {skills.length === 0 && <p className="text-muted-foreground text-center py-10">No skills found.</p>}
                                        {skills.map(skill => (
                                            <div key={skill._id} className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/30 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                                        {skill.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold flex items-center gap-2">
                                                            {skill.name}
                                                            {skill.featured && <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="secondary" className="text-[10px]">{skill.category}</Badge>
                                                            <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" onClick={() => setSkillToDelete(skill._id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

