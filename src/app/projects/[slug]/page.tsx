import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Github, MonitorPlay, Calendar, ExternalLink } from "lucide-react";
import Link from "next/link";

import { ProjectImageGallery } from "@/components/ui/project-image-gallery";
import { PortfolioService } from "@/lib/services/portfolio-service";


export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await PortfolioService.getProject(slug);

  if (!project) {
    notFound();
  }

  // Get all images (with coverImage fallback for backward compatibility)
  const allImages = project.images && project.images.length > 0
    ? project.images
    : (project.coverImage ? [project.coverImage] : []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-20">
      <Link href="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
      </Link>

      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">{project.title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          {project.featured && <Badge>Featured Case Study</Badge>}
          {project.publishedAt && <span className="text-muted-foreground flex items-center gap-1 text-sm"><Calendar className="h-4 w-4" /> {new Date(project.publishedAt).toLocaleDateString()}</span>}
        </div>
        <p className="text-xl text-muted-foreground leading-relaxed">
          {project.excerpt}
        </p>

        <div className="flex flex-wrap gap-4 mt-4">
          {project.demoUrl && (
            <Button asChild>
              <Link href={project.demoUrl} target="_blank">
                <MonitorPlay className="mr-2 h-4 w-4" /> Live Demo
              </Link>
            </Button>
          )}
          {project.repoUrl && (
            <Button variant="outline" asChild>
              <Link href={project.repoUrl} target="_blank">
                <Github className="mr-2 h-4 w-4" /> View Source
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 py-6 border-y">
        {project.tags.map((tag: string) => (
          <Badge key={tag} variant="secondary" className="px-3 py-1 text-sm">{tag}</Badge>
        ))}
      </div>

      {/* Project Images Gallery */}
      {allImages.length > 0 && (
        <ProjectImageGallery images={allImages} title={project.title} />
      )}

      <article className="prose prose-lg dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: project.content }} />
      </article>

      <div className="border-t pt-8 mt-8 flex justify-center">
        <Button variant="ghost" asChild>
          <Link href="/contact">
            Interested in building something similar? Let&apos;s talk. <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
