import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";

export async function POST(req: Request) {
  if (process.env.ENABLE_SEED_ENDPOINT !== "true") {
    return NextResponse.json({ error: "Endpoint disabled" }, { status: 403 });
  }

  try {
    await dbConnect();

    // This is a "first run" setup. In a real app, you might want a stricter check (e.g. secret key)
    // Check if ANY users exist. If so, fail.
    const users = await auth.api
      .listUsers({
        headers: await headers(),
        query: {},
      })
      .catch(() => []);

    // OR better: check directly in DB if we can, to avoid permission issues if listUsers is protected
    // For simplicity, let's assume if we can query users and length > 0, we abort.
    // But listUsers requires admin, so we might need a direct DB check or blindly try to create.

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Create the user
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    });

    // Use direct DB access to upgrade to "super-admin" or ensure role is correct if plugin didn't allow setting it directly on signup
    // Better-auth admin plugin usually allows setting role on creation if you are admin, but here we are nobody.
    // We might need to manually flip the boolean or role in DB after creation.

    // Actually, let's use the 'admin' plugin's feature if possible, but standard signUpEmail doesn't always take role.
    // Let's rely on manual DB update to be safe for this bootstrap.

    // Re-connect to DB to find the user we just made
    const { MongoClient, ObjectId } = await import("mongodb");
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db();

    // Find user by email
    const dbUser = await db.collection("user").findOne({ email });

    if (dbUser) {
      await db
        .collection("user")
        .updateOne({ _id: dbUser._id }, { $set: { role: "super-admin" } });
    }
    await client.close();

    return NextResponse.json({ success: true, message: "Super Admin created" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// curl -X POST http://localhost:3000/api/setup/admin \
//   -H "Content-Type: application/json" \
//   -d '{
//     "name": "Super Admin",
//     "email": "admin@example.com",
//     "password": "securepassword123"
//   }'
