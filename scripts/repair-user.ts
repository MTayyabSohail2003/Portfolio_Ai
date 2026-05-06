import { MongoClient, ObjectId } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

async function repair() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI not found");

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const email = "tayyab@gmail.com";

    // 1. Find the user
    const user = await db.collection("user").findOne({ email });
    if (!user) {
      console.log("User not found!");
      return;
    }
    console.log("Found user:", user._id);

    // 2. Ensure role is correct
    await db.collection("user").updateOne(
      { _id: user._id },
      { $set: { role: "super-admin" } }
    );

    // 3. Delete any old sessions for this user to prevent hangs
    const sessionResult = await db.collection("session").deleteMany({ userId: user._id });
    console.log(`Sessions cleared: ${sessionResult.deletedCount}`);

    // 4. Verify account exists
    const account = await db.collection("account").findOne({ userId: user._id });
    if (!account) {
      console.log("No account found! Creating one...");
      await db.collection("account").insertOne({
        userId: user._id,
        accountId: user._id.toString(),
        providerId: "credential",
        // Hash for Tayyab@123
        password: "02d3134f3af6aa55b2ef835254285ad4:664e9221f7c3e7ac9a7201558d08abeaf02a721f63b115fd060653b16db34a14f2e52b656369840b0b098799c8208e33570983bd352602cfe3e7cd4e097c3b20",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Account created.");
    } else {
      console.log("Account verified.");
      // Force update password just in case
      await db.collection("account").updateOne(
        { userId: user._id },
        { $set: { 
            password: "02d3134f3af6aa55b2ef835254285ad4:664e9221f7c3e7ac9a7201558d08abeaf02a721f63b115fd060653b16db34a14f2e52b656369840b0b098799c8208e33570983bd352602cfe3e7cd4e097c3b20",
            updatedAt: new Date()
          } 
        }
      );
      console.log("Account password synchronized.");
    }

    console.log("Repair complete!");
  } catch (error) {
    console.error("Repair failed:", error);
  } finally {
    await client.close();
  }
}

repair();
