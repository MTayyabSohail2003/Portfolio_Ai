import { auth } from "@/lib/auth";
import Project from "@/lib/db/models/Project";
import dbConnect from "@/lib/db/connect";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import slugify from "slugify";
import { PortfolioService } from "@/lib/services/portfolio-service";
import { z } from "zod";

const projectSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().min(10),
  content: z.string().min(50),
  tags: z.array(z.string()).default([]),
  demoUrl: z.string().optional().or(z.literal("")),
  repoUrl: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional(), // Backward compatibility
  images: z.array(z.string()).default([]), // New: multiple images support
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
});


export async function GET() {
  const projects = await PortfolioService.getProjects();
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();

    const result = projectSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;
    const slug =
      data.slug || slugify(data.title, { lower: true, strict: true });

    // Check for duplicate slug
    const existing = await Project.findOne({ slug });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 409 }
      );
    }

    const project = await Project.create({ ...data, slug });

    // RAG Automation: Index to Pinecone
    // RAG Automation: Index to Pinecone
    try {
      const { embedText } = await import("@/lib/ai/embeddings");
      const { saveVector } = await import("@/lib/ai/vector-store");

      const textToEmbed = `Project: ${project.title}\n\n${project.excerpt}\n\n${project.content}`;
      const vector = await embedText(textToEmbed);

      if (vector) {
        await saveVector({
          id: project._id.toString(),
          values: vector,
          metadata: {
            text: textToEmbed,
            type: "project",
            title: project.title,
            url: `/projects/${project.slug}`,
          },
        });
        console.log("Auto-indexed project to Pinecone:", project.title);
      }
    } catch (error) {
      console.error("RAG Auto-indexing failed:", error);
      // Don't fail the request, just log it
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
