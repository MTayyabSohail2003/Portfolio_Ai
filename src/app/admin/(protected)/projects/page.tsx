"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Plus, Edit, Eye, FolderOpen, CheckCircle2, CircleDashed, ImageIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    repoUrl: string;
    demoUrl: string;
    published: boolean;
    featured: boolean;
    coverImage?: string; // Backward compatibility
    images?: string[];   // New: multiple images
}

export default function ProjectManagerPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const res = await fetch("/api/projects");
            const data = await res.json();
            setProjects(data);
        } catch {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        const toastId = toast.loading("Deleting...");
        try {
            await fetch(`/api/projects/${projectToDelete}`, { method: "DELETE" });
            toast.success("Deleted", { id: toastId });
            setProjects(projects.filter((p) => p._id !== projectToDelete));
        } catch {
            toast.error("Failed to delete", { id: toastId });
        } finally {
            setProjectToDelete(null);
        }
    };

    const filteredProjects = (status: "all" | "published" | "draft") => {
        if (status === "all") return projects;
        if (status === "published") return projects.filter(p => p.published);
        return projects.filter(p => !p.published);
    };

    const ProjectList = ({ status }: { status: "all" | "published" | "draft" }) => {
        const items = filteredProjects(status);

        if (items.length === 0) {
            return (
                <div className="col-span-full text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No projects found in this view.</p>
                    {status === 'all' && (
                        <Link href="/admin/projects/new" className="text-primary hover:underline mt-2 inline-block">Create your first case study</Link>
                    )}
                </div>
            );
        }

        return (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map(project => {
                    // Get cover image (first from images array, or fallback to coverImage)
                    const allImages = project.images && project.images.length > 0
                        ? project.images
                        : (project.coverImage ? [project.coverImage] : []);
                    const coverImage = allImages[0];
                    const imageCount = allImages.length;

                    return (
                        <Card key={project._id} className={`relative group overflow-hidden hover:shadow-lg transition-all ${!project.published ? 'opacity-85 border-dashed bg-muted/20' : ''}`}>
                            {/* Cover Image Only */}
                            {coverImage ? (
                                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                    <img
                                        src={coverImage}
                                        alt={project.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    {/* Image count badge (if more than 1 image) */}
                                    {imageCount > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                                            <ImageIcon className="w-3 h-3" />
                                            {imageCount}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="aspect-video w-full overflow-hidden bg-muted/50 flex items-center justify-center">
                                    <ImageIcon className="w-10 h-10 text-muted-foreground/30" />
                                </div>
                            )}

                            <CardContent className="p-4 flex flex-col justify-between">
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-start gap-2">
                                        <h3 className="font-bold text-base line-clamp-1">{project.title}</h3>
                                        {project.featured && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 flex-shrink-0">Featured</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{project.excerpt}</p>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                                    {project.published ? (
                                        <Badge variant="default" className="text-[10px] bg-green-600/10 text-green-600 hover:bg-green-600/20 border-green-600/20 h-5">
                                            <CheckCircle2 className="w-3 h-3 mr-1" /> Published
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30 h-5">
                                            <CircleDashed className="w-3 h-3 mr-1" /> Draft
                                        </Badge>
                                    )}

                                    <div className="flex gap-1">
                                        {project.published && (
                                            <Link href={`/projects/${project.slug}`} target="_blank">
                                                <Button variant="ghost" size="icon" className="h-7 w-7">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </Button>
                                            </Link>
                                        )}
                                        <Link href={`/admin/projects/${project._id}`}>
                                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500" onClick={() => setProjectToDelete(project._id)}>
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    };


    return (
        <div className="flex flex-col gap-6 max-w-6xl mx-auto">
            <ConfirmModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
                title="Delete Project"
                description="Are you sure you want to delete this project?"
            />
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold tracking-tight">Project Manager</h2>
                    <p className="text-muted-foreground">Showcase your best work. Manage case studies.</p>
                </div>
                <Link href="/admin/projects/new">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="all" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="all">
                            All <span className="ml-2 text-xs bg-primary/10 px-1.5 py-0.5 rounded-full">{projects.length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="published">
                            Published <span className="ml-2 text-xs bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded-full">{projects.filter(p => p.published).length}</span>
                        </TabsTrigger>
                        <TabsTrigger value="draft">
                            Drafts <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">{projects.filter(p => !p.published).length}</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <Card>
                    <CardContent className="p-6">
                        {loading ? (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton key={i} className="h-40 w-full" />
                                ))}
                            </div>
                        ) : (
                            <>
                                <TabsContent value="all" className="mt-0">
                                    <ProjectList status="all" />
                                </TabsContent>
                                <TabsContent value="published" className="mt-0">
                                    <ProjectList status="published" />
                                </TabsContent>
                                <TabsContent value="draft" className="mt-0">
                                    <ProjectList status="draft" />
                                </TabsContent>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    );
}
