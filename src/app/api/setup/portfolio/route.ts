import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import Experience from "@/lib/db/models/Experience";
import Project from "@/lib/db/models/Project";
import Skill from "@/lib/db/models/Skill";
import Education from "@/lib/db/models/Education";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import slugify from "slugify";
import { PORTFOLIO_DATA } from "@/lib/data/portfolio-seed";

export async function POST(req: Request) {
  try {
    // Check feature flag first
    if (process.env.ENABLE_SEED_ENDPOINT !== "true") {
      return NextResponse.json(
        { error: "Seeding is disabled. Set ENABLE_SEED_ENDPOINT=true in .env" },
        { status: 403 }
      );
    }

    // Optional: Log session if exists, but allow request based on flag
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    await dbConnect();

    // 1. Seed Experience
    await Experience.deleteMany({});
    await Experience.insertMany(PORTFOLIO_DATA.experience);

    // 2. Seed Projects
    await Project.deleteMany({});
    const projectsWithSlugs = PORTFOLIO_DATA.projects.map((p) => ({
      ...p,
      slug: slugify(p.title, { lower: true, strict: true }),
    }));
    await Project.insertMany(projectsWithSlugs);

    // 3. Seed Skills
    await Skill.deleteMany({});
    await Skill.insertMany(PORTFOLIO_DATA.skills);

    // 4. Seed Education
    await Education.deleteMany({});
    await Education.insertMany(PORTFOLIO_DATA.education);

    return NextResponse.json({
      success: true,
      message: "Portfolio content seeded successfully!",
      counts: {
        experiences: PORTFOLIO_DATA.experience.length,
        projects: PORTFOLIO_DATA.projects.length,
        skills: PORTFOLIO_DATA.skills.length,
        education: PORTFOLIO_DATA.education.length,
      },
    });
  } catch (error) {
    console.error("Seeding Error:", error);
    return NextResponse.json(
      { error: "Failed to seed data", details: (error as Error).message },
      { status: 500 }
    );
  }
}
