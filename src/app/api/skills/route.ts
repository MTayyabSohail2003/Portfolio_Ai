import { auth } from "@/lib/auth";
import Skill from "@/lib/db/models/Skill";
import dbConnect from "@/lib/db/connect";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { PortfolioService } from "@/lib/services/portfolio-service";

export async function GET() {
  const skills = await PortfolioService.getAllSkillsRaw();
  return NextResponse.json(skills);
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

    // Basic validation
    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: "Name and Category are required" },
        { status: 400 }
      );
    }

    const skill = await Skill.create(body);
    return NextResponse.json(skill);
  } catch (error) {
    console.error("Error creating skill:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}
