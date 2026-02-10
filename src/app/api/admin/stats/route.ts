import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import Project from "@/lib/db/models/Project";
import Experience from "@/lib/db/models/Experience";
import SiteAnalytics from "@/lib/db/models/SiteAnalytics";
import Blog from "@/lib/db/models/Blog";
import Contact from "@/lib/db/models/Contact";
import User from "@/lib/db/models/User";

export async function GET(req: Request) {
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

    // Parallel fetch counts from Mongoose Models
    const [
      projectCount,
      experienceCount,
      blogCount,
      userCount,
      messageCount,
      recentProjects,
      recentBlogs,
      recentMessages,
      analyticsDoc,
    ] = await Promise.all([
      Project.countDocuments(),
      Experience.countDocuments(),
      Blog.countDocuments(),
      User.countDocuments(),
      Contact.countDocuments(),
      Project.find().sort({ createdAt: -1 }).limit(5).lean(),
      Blog.find().sort({ createdAt: -1 }).limit(5).lean(),
      Contact.find().sort({ createdAt: -1 }).limit(5).lean(),
      SiteAnalytics.findOne({ metric: "total_views" }),
    ]);

    // RAG Stats
    let ragCount = projectCount + experienceCount + blogCount; // fallback
    try {
      const { getIndexStats } = await import("@/lib/ai/vector-store");
      const pineconeStats = await getIndexStats();
      if (pineconeStats && pineconeStats.totalRecordCount) {
        ragCount = pineconeStats.totalRecordCount;
      }
    } catch (e) {
      console.error("Failed to fetch Pinecone stats", e);
    }

    // Combine and sort recent activity
    const activity = [
      ...recentProjects.map((p: any) => ({
        id: p._id,
        type: "project",
        title: p.title,
        date: p.createdAt,
      })),
      ...recentBlogs.map((b: any) => ({
        id: b._id,
        type: "blog",
        title: b.title,
        date: b.createdAt || b.publishedAt,
      })),
      ...recentMessages.map((m: any) => ({
        id: m._id,
        type: "message",
        title: `Message from ${m.name}`,
        date: m.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const stats = {
      views: analyticsDoc?.count || 0,
      messages: messageCount,
      ragDocs: ragCount,
      projects: projectCount,
      systemStatus: "Healthy",
      recentActivity: activity,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
