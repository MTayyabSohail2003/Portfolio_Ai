import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import { z } from "zod";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = emailSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = result.data;
    await dbConnect();

    // Direct access to collection for now (or create model)
    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Upsert to avoid duplicates
    await db
      .collection("newsletter")
      .updateOne(
        { email },
        { $set: { email, subscribedAt: new Date(), active: true } },
        { upsert: true }
      );

    await client.close();

    return NextResponse.json({ message: "Subscribed successfully!" });
  } catch (error) {
    console.error("Newsletter Subscription Error:", error);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}
