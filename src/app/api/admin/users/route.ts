import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (
      !session ||
      (session.user.role !== "admin" && session.user.role !== "super-admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    const users = await db
      .collection("user")
      .find({}, { projection: { password: 0 } })
      .toArray();
    await client.close();

    // Map _id to id for consistency if needed, though client likely handles it
    const formattedUsers = users.map((u) => ({ ...u, id: u._id.toString() }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to list users" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Ensure only super-admin can create users
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { email, password, name, role } = body;

    // Use better-auth API to create user
    const newUser = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    // If role didn't stick (plugin dependent), force update it
    if (role && newUser.user.role !== role) {
      const { MongoClient, ObjectId } = await import("mongodb");
      const client = new MongoClient(process.env.MONGODB_URI!);
      await client.connect();
      const db = client.db();
      await db
        .collection("user")
        .updateOne(
          { _id: new ObjectId(newUser.user.id) },
          { $set: { role: role } }
        );
      await client.close();
    }

    return NextResponse.json({ success: true, user: newUser.user });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}
