import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getIndexStats } from "@/lib/ai/vector-store";

export const revalidate = 0; // Disable caching for stats

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

    const stats = await getIndexStats();

    return NextResponse.json(stats || { totalRecordCount: 0 });
  } catch (error: any) {
    console.error("RAG Stats API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
