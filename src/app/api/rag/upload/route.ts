import { auth } from "@/lib/auth";
import { embedText } from "@/lib/ai/embeddings";
import { saveVector } from "@/lib/ai/vector-store";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { nanoid } from "nanoid";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const textInput = formData.get("text") as string;

    let content = "";

    if (file) {
      // Simple text file handling for now
      content = await file.text();
    } else if (textInput) {
      content = textInput;
    } else {
      return NextResponse.json(
        { error: "No file or text provided" },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json({ error: "Content is empty" }, { status: 400 });
    }

    // Generate Embedding
    const vector = await embedText(content);

    if (!vector) {
      return NextResponse.json(
        { error: "Failed to generate embeddings" },
        { status: 500 }
      );
    }

    // ID for the vector
    const id = nanoid();

    // Upsert to Pinecone
    await saveVector({
      id,
      values: vector,
      metadata: {
        text: content,
        type: "general", // Default type for generic uploads
        source: file ? file.name : "manual_input",
        uploadedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("RAG Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to process document" },
      { status: 500 }
    );
  }
}
