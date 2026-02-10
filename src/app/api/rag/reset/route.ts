import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { deleteAllVectors } from "@/lib/ai/vector-store";

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

    const success = await deleteAllVectors();

    if (success) {
      return NextResponse.json({
        success: true,
        message: "All vectors deleted successfully.",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to delete vectors. Check logs." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("RAG Reset Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
