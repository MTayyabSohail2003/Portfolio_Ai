"use server";

import { auth } from "@/lib/auth"; // Adjust path
import { headers } from "next/headers";
import { runFinanceAgent } from "@/lib/ai/cfo-agent";
import dbConnect from "@/lib/db/connect";

export async function chatWithCFO(history: any[], message: string) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const reply = await runFinanceAgent(history, message, session.user.id);
  return { success: true, reply };
}
