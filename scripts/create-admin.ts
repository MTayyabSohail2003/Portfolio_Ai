import * as dotenv from "dotenv";
dotenv.config();

import { auth } from "../src/lib/auth";
import { MongoClient } from "mongodb";

async function main() {
  const email = "tayyab@gamil.com";
  const password = "Tayyab@123";
  const name = "Tayyab Sohail";

  console.log(`Creating superadmin: ${email}`);

  try {
    // 1. Create user via better-auth
    try {
      await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });
      console.log("User created successfully via Better Auth.");
    } catch (e: any) {
      // Better-auth might throw if user exists
      console.log("Better Auth signup attempt finished (might have existed already).");
    }

    // 2. Update role to super-admin in MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI not found");

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db();
    
    const result = await db.collection("user").updateOne(
      { email },
      { $set: { role: "super-admin" } }
    );

    if (result.modifiedCount > 0) {
      console.log("Role updated to 'super-admin' successfully.");
    } else {
      const user = await db.collection("user").findOne({ email });
      if (user && user.role === "super-admin") {
        console.log("User already has 'super-admin' role.");
      } else {
        console.log("Role update failed. User might not exist in 'user' collection.");
      }
    }

    await client.close();
    console.log("Done!");
    process.exit(0);
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
}

main();
