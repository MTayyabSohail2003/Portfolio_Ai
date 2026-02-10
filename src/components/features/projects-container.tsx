"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, MonitorPlay, FolderOpen, FolderSearch } from "lucide-react";
import Link from "next/link";
import { ProjectsSkeleton } from "./skeletons";
import { SearchFilter } from "@/components/ui/search-filter";

export default function ProjectsContainer() {
  const [projects, setProjects] = useState<any[]>([]);
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
            <Card key={project._id} className="flex flex-col h-full hover:shadow-lg transition-shadow border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-xl line-clamp-1">{project.title}</CardTitle>
                    {project.featured && (
                        <Badge variant="default" className="shrink-0 bg-primary/20 text-primary hover:bg-primary/30 text-xs">Featured</Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.excerpt}</p>
              </CardHeader>
              <CardContent className="grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.slice(0, 4).map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 4 && (
                      <Badge variant="outline" className="text-xs">+{project.tags.length - 4}</Badge>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-auto pt-4 border-t bg-muted/20">
                 <Button variant="ghost" size="sm" asChild>
                    <Link href={`/projects/${project.slug}`}>
                        <FolderOpen className="mr-2 h-4 w-4" /> Details
                    </Link>
                 </Button>
                 <div className="flex gap-2">
                    {project.demoUrl && (
                        <Button variant="ghost" size="icon" asChild title="Live Demo">
                            <Link href={project.demoUrl} target="_blank"><MonitorPlay className="h-4 w-4" /></Link>
                        </Button>
                    )}
                    {project.repoUrl && (
                        <Button variant="ghost" size="icon" asChild title="View Code">
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
