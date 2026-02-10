"use server";

import { auth } from "@/lib/auth"; // Adjust path
import { headers } from "next/headers";
import { runUniversalAgent } from "@/lib/ai/universal-agent";
import dbConnect from "@/lib/db/connect";

export async function chatWithUniversalAgent(history: any[], message: string) {
  await dbConnect();
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  // Default to 'public' anonymous
  let userId = "anon";
  let role: "public" | "admin" | "super-admin" = "public";

  if (session?.user) {
    userId = session.user.id;
    // Map session role to agent role
    if (session.user.role === "admin") role = "admin";
    // Assuming strict string match or logic for super-admin
    // For now, let's assume 'admin' might be super admin if specific email,
    // OR if your session schema has 'super-admin'.
    // Let's rely on the session role property directly if it matches.
    if (session.user.role === "super-admin") role = "super-admin";

    // Manual override for dev/testing if needed, strict check recommended
    // e.g. if (session.user.email === process.env.ADMIN_EMAIL) role = "super-admin";
  }

  const reply = await runUniversalAgent(history, message, userId, role);
  return { success: true, reply, roleDetected: role };
}
