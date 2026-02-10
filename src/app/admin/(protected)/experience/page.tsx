"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { format } from "date-fns";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { CharacterProgress } from "@/components/ui/character-progress";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { TagsInput } from "@/components/ui/tags-input";
import { SmartTextarea } from "@/components/ui/smart-textarea";

interface Experience {
  _id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  technologies: string[];
}

const experienceSchema = z.object({
  position: z.string()
    .min(5, "Position must be at least 5 characters")
    .max(100, "Position must be less than 100 characters"),
  company: z.string()
    .min(10, "Company must be at least 10 characters")
    .max(100, "Company must be less than 100 characters"),
  location: z.string().max(100, "Location must be less than 100 characters").optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean(),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  technologies: z.array(z.string()),
});

type ExperienceFormValues = z.infer<typeof experienceSchema>;

export default function ExperienceManagerPage() {
  const [experienceList, setExperienceList] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      position: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      technologies: [],
    },
  });

  const { formState: { errors, dirtyFields, isSubmitted } } = form;

  // Helper to get field validation state
  const getFieldState = (fieldName: keyof ExperienceFormValues) => {
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

  const fetchExperience = async () => {
    try {
      const res = await fetch("/api/experience");
      const data = await res.json();
      setExperienceList(data);
    } catch (error) {
      toast.error("Failed to load experience");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperience();
  }, []);

  const onSubmit = async (data: ExperienceFormValues) => {
    const toastId = toast.loading("Adding experience...");

    try {
      const payload = {
        ...data,
        endDate: data.current ? null : data.endDate,
      };

      const res = await fetch("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed");

      toast.success("Experience added!", { id: toastId });
      form.reset({
        position: "", company: "", location: "", startDate: "", endDate: "",
        current: false, description: "", technologies: []
      });
      fetchExperience();
    } catch (error) {
      toast.error("Failed to add experience", { id: toastId });
    }
  };

  const [expToDelete, setExpToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!expToDelete) return;
    const toastId = toast.loading("Deleting...");
    try {
      await fetch(`/api/experience/${expToDelete}`, { method: "DELETE" });
      toast.success("Deleted", { id: toastId });
      setExperienceList(experienceList.filter((e) => e._id !== expToDelete));
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    } finally {
      setExpToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <ConfirmModal
        isOpen={!!expToDelete}
        onClose={() => setExpToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Experience"
        description="Are you sure you want to delete this experience entry?"
      />
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Experience Manager</h2>
        <p className="text-muted-foreground">Manage your work history timeline.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Add Form */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="w-5 h-5" /> Add Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => {
                      const state = getFieldState("position");
                      const charCount = field.value?.length || 0;
                      return (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="flex items-center gap-2">
                              Position
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
                                placeholder="Senior Engineer"
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
                    name="company"
                    render={({ field }) => {
                      const state = getFieldState("company");
                      const charCount = field.value?.length || 0;
                      return (
                        <FormItem>
                          <div className="flex items-center justify-between">
                            <FormLabel className="flex items-center gap-2">
                              Company
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
                                placeholder="Acme Corp"
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
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => {
                    const state = getFieldState("location");
                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          Location
                          {state === "success" && field.value && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Remote / New York, NY"
                              className={getInputClassName(state)}
                              maxLength={100}
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

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => {
                      const state = getFieldState("startDate");
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            Start Date
                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className={getInputClassName(state)}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => {
                      const state = getFieldState("endDate");
                      const isCurrentlyWorking = form.watch("current");
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            End Date
                            {state === "success" && !isCurrentlyWorking && field.value && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className={cn(getInputClassName(state), isCurrentlyWorking && "opacity-50")}
                              disabled={isCurrentlyWorking}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="current"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I currently work here</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => {
                    const state = getFieldState("description");
                    const charCount = field.value?.length || 0;
                    return (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel className="flex items-center gap-2">
                            Description
                            {state === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                          </FormLabel>
                          <span className={cn(
                            "text-xs transition-colors",
                            charCount === 0 ? "text-muted-foreground" :
                              charCount < 10 ? "text-orange-500" :
                                charCount > 1000 ? "text-destructive" : "text-green-500"
                          )}>
                            {charCount}/1000
                          </span>
                        </div>
                        <FormControl>
                          <SmartTextarea
                            placeholder="Describe your responsibilities..."
                            rows={5}
                            disableAiButton={!form.watch("position")}
                            className={getInputClassName(state)}
                            {...field}
                            context={{
                              position: form.watch("position"),
                              company: form.watch("company"),
                              technologies: form.watch("technologies"),
                            }}
                          />
                        </FormControl>
                        <CharacterProgress current={charCount} min={10} max={1000} />
                        <FormMessage className="text-xs" />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="technologies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Technologies</FormLabel>
                      <FormControl>
                        <TagsInput
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Type tech stack and press Enter..."
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Adding..." : "Add Experience"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* List View */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : (
              <div className="relative border-l border-muted ml-3 space-y-8 pl-6">
                {experienceList.map(exp => (
                  <div key={exp._id} className="relative group">
                    {/* Dot */}
                    <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border bg-background ring-4 ring-background">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    </span>

                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{exp.position}</h3>
                        <p className="text-muted-foreground font-medium">{exp.company}</p>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(new Date(exp.startDate), 'MMM yyyy')} - {exp.current ? 'Present' : (exp.endDate ? format(new Date(exp.endDate), 'MMM yyyy') : '')}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setExpToDelete(exp._id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>

                    <p className="text-sm line-clamp-3 text-muted-foreground mb-2 whitespace-pre-line">{exp.description}</p>

                    <div className="flex flex-wrap gap-1">
                      {exp.technologies.map(tech => (
                        <span key={tech} className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {experienceList.length === 0 && <p className="text-muted-foreground text-sm">No experience added yet.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

