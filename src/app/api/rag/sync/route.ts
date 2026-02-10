import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import Project from "@/lib/db/models/Project";
import Experience from "@/lib/db/models/Experience";
import Blog from "@/lib/db/models/Blog";
import { embedText } from "@/lib/ai/embeddings";
import { saveVector } from "@/lib/ai/vector-store";
import { nanoid } from "nanoid";
import { chunkText } from "@/lib/ai/chunking";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "super-admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const projects = await Project.find({});
    const experiences = await Experience.find({});
    const blogs = await Blog.find({ published: true });

    let processedCount = 0;

    // 2. Process Projects
    for (const p of projects) {
      const text = `Project: ${p.title}. Technologies: ${p.technologies?.join(
        ", "
      )}. Description: ${p.description || ""} ${p.content || ""}`;
      const vector = await embedText(text);

      await saveVector({
        id: `proj_${p._id}`,
        values: vector,
        metadata: {
          text,
          type: "project",
          title: p.title,
          source: "mongodb_sync",
        },
      });
      processedCount++;
    }

    // 3. Process Experience
    for (const exp of experiences) {
      const text = `Experience: ${exp.role} at ${exp.company} (${
        exp.duration
      }). Description: ${exp.description || ""}`;
      const vector = await embedText(text);

      await saveVector({
        id: `exp_${exp._id}`,
        values: vector,
        metadata: {
          text,
          type: "experience",
          title: `${exp.role} at ${exp.company}`,
          source: "mongodb_sync",
        },
      });
      processedCount++;
    }

    // 4. Process Blogs
    for (const blog of blogs) {
      const contentToChunk = `Title: ${blog.title}\nDescription: ${blog.excerpt}\nContent: ${blog.content}`;

      const chunks = await chunkText(contentToChunk, 1500, 200);

      for (const [i, chunk] of chunks.entries()) {
        const vector = await embedText(chunk);
        await saveVector({
          id: `blog_${blog._id}_${i}`,
          values: vector,
          metadata: {
            text: chunk,
            type: "blog",
            title: blog.title,
            source: "mongodb_sync",
            chunkIndex: i,
          },
        });
      }
      processedCount++;
    }

    try {
      const fs = require("fs").promises;
      const path = require("path");
      const docPath = path.join(process.cwd(), "docs", "portfolio.md");

      const fileContent = await fs.readFile(docPath, "utf-8");

      const sections = fileContent
        .split(/^## /gm)
        .filter((s: string) => s.trim().length > 0);

      for (const [sectionIndex, section] of sections.entries()) {
        const lines = section.trim().split("\n");
        const title = lines[0].trim().replace(/\*\*/g, "");
        const content = lines.slice(1).join("\n").trim();

        if (content.length < 50) continue;

        const sectionChunks = await chunkText(content, 1500, 300);

        for (const [chunkIndex, chunk] of sectionChunks.entries()) {
          const text = `Portfolio Context (${title}): ${chunk}`;
          const vector = await embedText(text);

          await saveVector({
            id: `portfolio_doc_${sectionIndex}_${chunkIndex}`,
            values: vector,
            metadata: {
              text,
              type: "core_context",
              title: `Portfolio: ${title}`,
              source: "portfolio_md_sync",
              section: title,
            },
          });
          processedCount++;
        }
      }
    } catch (err) {
      console.error("Failed to index portfolio.md:", err);
    }

    return NextResponse.json({
      success: true,
      message: `Synced ${processedCount} documents to Pinecone.`,
      count: processedCount,
    });
  } catch (error: any) {
    console.error("RAG Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
