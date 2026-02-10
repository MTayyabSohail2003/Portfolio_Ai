import { runBulkTaskAgent } from "@/lib/ai/agents";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, boardId } = body;

    if (!prompt || !boardId) {
      return NextResponse.json(
        { error: "Missing prompt or boardId" },
        { status: 400 }
      );
    }

    const result = await runBulkTaskAgent(prompt, boardId, session.user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Agent API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
