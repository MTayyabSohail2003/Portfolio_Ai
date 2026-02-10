import { auth } from "@/lib/auth";
import Project from "@/lib/db/models/Project";
import dbConnect from "@/lib/db/connect";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    let project;

    if (isObjectId) {
      project = await Project.findById(id);
    }

    if (!project) {
      // Try slug
      project = await Project.findOne({ slug: id });
    }

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    await Project.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    await dbConnect();

    const updatedProject = await Project.findByIdAndUpdate(id, body, {
      new: true,
    });

    // RAG Automation: Re-index to Pinecone
    if (updatedProject) {
      try {
        const { embedText } = await import("@/lib/ai/embeddings");
        const { saveVector } = await import("@/lib/ai/vector-store");

        const textToEmbed = `Project: ${updatedProject.title}\n\n${updatedProject.excerpt}\n\n${updatedProject.content}`;
        const vector = await embedText(textToEmbed);

        if (vector) {
          await saveVector({
            id: updatedProject._id.toString(),
            values: vector,
            metadata: {
              text: textToEmbed,
              type: "project",
              title: updatedProject.title,
              url: `/projects/${updatedProject.slug}`,
            },
          });
          console.log(
            "Auto-updated project in Pinecone:",
            updatedProject.title
          );
        }
      } catch (error) {
        console.error("RAG Auto-indexing failed:", error);
      }
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}
