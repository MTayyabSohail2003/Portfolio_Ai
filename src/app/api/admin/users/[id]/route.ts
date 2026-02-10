import { auth } from "@/lib/auth";
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

    // Only super-admin can delete users
    if (!session || session.user.role !== "super-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete yourself" },
        { status: 400 }
      );
    }

    const { MongoClient, ObjectId } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    const targetUser = await db
      .collection("user")
      .findOne({ _id: new ObjectId(id) });
    if (targetUser && targetUser.role === "super-admin") {
      return NextResponse.json(
        { error: "Cannot delete a Super Admin account" },
        { status: 403 }
      );
    }

    await db.collection("user").deleteOne({ _id: new ObjectId(id) });
    await db.collection("session").deleteMany({ userId: id }); // Clean sessions
    await db.collection("account").deleteMany({ userId: id }); // Clean accounts

    await client.close();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
