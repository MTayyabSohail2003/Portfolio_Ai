import { auth } from "@/lib/auth";
import Skill from "@/lib/db/models/Skill";
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
    await Skill.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete skill" },
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

    const updatedSkill = await Skill.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedSkill);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}
