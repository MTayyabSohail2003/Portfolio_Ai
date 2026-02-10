import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Blog from "@/lib/db/models/Blog";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import slugify from "slugify";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(2),
  slug: z.string().optional(),
  excerpt: z.string().min(10),
  content: z.string().min(50),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false),
  published: z.boolean().default(false), // Logic differs slightly from form default, but safer for API
  readTime: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    await dbConnect();

    // Check query params for "published only" vs "all" (for admin)
    const { searchParams } = new URL(req.url);
    const adminMode = searchParams.get("admin") === "true";

    let query = {};
    if (!adminMode) {
      query = { published: true };
    } else {
      // If admin mode requested, verify session
      const session = await auth.api.getSession({ headers: await headers() });
      if (
        !session ||
        (session.user.role !== "admin" && session.user.role !== "super-admin")
      ) {
        // Fallback to public only if unauthorized
        query = { published: true };
      }
    }

    const blogs = await Blog.find(query).sort({
      publishedAt: -1,
      createdAt: -1,
    });
    return NextResponse.json(blogs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const body = await req.json();

    const result = blogSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid input", details: result.error.flatten() },
        { status: 400 }
      );
    }

    const data = result.data;

    // Auto-generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    // Default read time calc (rough est: 200 words / min)
    if (!data.readTime && data.content) {
      const wordCount = data.content
        .replace(/<[^>]*>?/gm, "")
        .split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200);
      data.readTime = `${minutes} min read`;
    }

    const blog = await Blog.create(data);
    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
