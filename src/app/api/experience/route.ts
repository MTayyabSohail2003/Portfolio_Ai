import { auth } from "@/lib/auth";
import Experience from "@/lib/db/models/Experience";
import dbConnect from "@/lib/db/connect";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PortfolioService } from "@/lib/services/portfolio-service";

export async function GET() {
  const experience = await PortfolioService.getExperience();
  return NextResponse.json(experience);
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

    if (!body.position || !body.company || !body.startDate) {
      return NextResponse.json(
        { error: "Position, Company, and Start Date are required" },
        { status: 400 }
      );
    }

    const experience = await Experience.create(body);

    // RAG Automation: Index to Pinecone
    // RAG Automation: Index to Pinecone
    try {
      const { embedText } = await import("@/lib/ai/embeddings");
      const { saveVector } = await import("@/lib/ai/vector-store");

      const textToEmbed = `Experience: ${experience.position} at ${
        experience.company
      } (${experience.startDate}). ${
        experience.description
      }. Technologies: ${experience.technologies.join(", ")}`;
      const vector = await embedText(textToEmbed);

      if (vector) {
        await saveVector({
          id: experience._id.toString(),
          values: vector,
          metadata: {
            text: textToEmbed,
            type: "experience",
            title: `${experience.position} at ${experience.company}`,
          },
        });
        console.log("Auto-indexed experience to Pinecone:", experience.company);
      }
    } catch (error) {
      console.error("RAG Auto-indexing failed:", error);
    }

    return NextResponse.json(experience);
  } catch (error) {
    console.error("Error creating experience:", error);
    return NextResponse.json(
      { error: "Failed to create experience" },
      { status: 500 }
    );
  }
}
