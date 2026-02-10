import type { Metadata } from "next";
import dbConnect from "@/lib/db/connect";
import Blog from "@/lib/db/models/Blog";
import BlogClient from "./blog-client";

export const metadata: Metadata = {
  title: "Blog | Muhammad Tayyab Sohail",
  description: "Insights on AI Engineering, Next.js Architecture, and Industrial Automation.",
};

export const revalidate = 60; // Revalidate every minute

async function getBlogs() {
  await dbConnect();
  const blogs = await Blog.find({ published: true })
    .sort({ publishedAt: -1 })
    .lean();

  // Serialize for Client Component prop passing
  return JSON.parse(JSON.stringify(blogs));
}

export default async function BlogPage() {
  const blogs = await getBlogs();

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Technical Writings</h1>
        <p className="text-xl text-muted-foreground">Thoughts on engineering, architecture, and the future of work.</p>
      </div>

      <BlogClient initialBlogs={blogs} />
    </div>
  );
}
