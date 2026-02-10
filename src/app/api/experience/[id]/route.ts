import { auth } from "@/lib/auth";
import Experience from "@/lib/db/models/Experience";
import dbConnect from "@/lib/db/connect";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

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
    await Experience.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete experience" },
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

    const updatedExperience = await Experience.findByIdAndUpdate(id, body, {
      new: true,
    });

    // RAG Automation: Re-index to Pinecone
    if (updatedExperience) {
      try {
        const { embedText } = await import("@/lib/ai/embeddings");
        const { saveVector } = await import("@/lib/ai/vector-store");

        const textToEmbed = `Experience: ${updatedExperience.position} at ${
          updatedExperience.company
        } (${updatedExperience.startDate}). ${
          updatedExperience.description
        }. Technologies: ${updatedExperience.technologies.join(", ")}`;
        const vector = await embedText(textToEmbed);

        if (vector) {
          await saveVector({
            id: updatedExperience._id.toString(),
            values: vector,
            metadata: {
              text: textToEmbed,
              type: "experience",
              title: `${updatedExperience.position} at ${updatedExperience.company}`,
            },
          });
          console.log(
            "Auto-indexed experience to Pinecone:",
            updatedExperience.company
          );
        }
      } catch (error) {
        console.error("RAG Auto-indexing failed:", error);
      }
    }

    return NextResponse.json(updatedExperience);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update experience" },
      { status: 500 }
    );
  }
}
