"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, MonitorPlay, FolderOpen, FolderSearch, ImageIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ProjectsSkeleton } from "./skeletons";
import { SearchFilter } from "@/components/ui/search-filter";
import { IProject } from "@/lib/db/models/Project";

export default function ProjectsContainer() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Failed to fetch projects", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // Compute available tags from all projects
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(p => p.tags.forEach((t: string) => tags.add(t)));
    return Array.from(tags).sort();
  }, [projects]);

  // Filter projects logic
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => project.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [projects, searchQuery, selectedTags]);

  if (loading) {
    return <ProjectsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <SearchFilter 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTags={selectedTags}
        setSelectedTags={setSelectedTags}
        availableTags={availableTags}
      />

      {filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-muted/10 border-dashed">
            <div className="bg-muted rounded-full p-4 mb-4">
                <FolderSearch className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-lg font-medium text-foreground">No projects found</p>
            <p className="text-sm mb-4">Try adjusting your search or filters.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(""); setSelectedTags([]); }}>Clear filters</Button>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={String(project._id)} className="group flex flex-col h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
              <div className="relative aspect-video w-full overflow-hidden bg-muted/50">
                {project.coverImage || (project.images && project.images.length > 0) ? (
                  <Image
                    src={project.coverImage || project.images[0]}
                    alt={project.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/5 to-primary/20">
                    <ImageIcon className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                {project.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge variant="default" className="bg-primary text-primary-foreground shadow-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Featured
                    </Badge>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <Button variant="secondary" size="sm" className="w-full shadow-lg" asChild>
                        <Link href={`/projects/${project.slug}`}>View Project</Link>
                    </Button>
                </div>
              </div>
              
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem] leading-relaxed mt-1">{project.excerpt}</p>
              </CardHeader>
              
              <CardContent className="p-4 pt-0 grow">
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {project.tags.slice(0, 4).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-primary/5 text-primary-foreground/70 hover:bg-primary/10 border-none px-2 py-0 text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 4 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/20">+{project.tags.length - 4}</Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between items-center p-4 pt-4 mt-auto border-t border-primary/5 bg-muted/5">
                 <Button variant="ghost" size="sm" className="text-xs h-8 px-2 hover:bg-primary/10 hover:text-primary" asChild>
                    <Link href={`/projects/${project.slug}`}>
                        <FolderOpen className="mr-1.5 h-3.5 w-3.5" /> Details
                    </Link>
                 </Button>
                 <div className="flex gap-1">
                    {project.demoUrl && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild title="Live Demo">
                            <Link href={project.demoUrl} target="_blank"><MonitorPlay className="h-4 w-4" /></Link>
                        </Button>
                    )}
                    {project.repoUrl && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild title="View Code">
                            <Link href={project.repoUrl} target="_blank"><Github className="h-4 w-4" /></Link>
                        </Button>
                    )}
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
