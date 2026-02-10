"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { uploadToCloudinary } from "@/lib/cloudinary";
import User from "@/lib/db/models/User";
import connectDB from "@/lib/db/connect";
import { revalidatePath } from "next/cache";

export async function uploadProfileImage(formData: FormData) {
  try {
    // 1. Auth Check
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "Unauthorized" };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { error: "No file provided" };
    }

    // 2. Convert to Base64 for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

    // 3. Upload
    const result = await uploadToCloudinary(base64, "portfolio/avatars");
    const imageUrl = result.secure_url;

    // 4. Update DB
    await connectDB();

    // Update Mongoose model
    await User.findOneAndUpdate(
      { email: session.user.email },
      { image: imageUrl }
    );

    // Also update via Better-Auth API if possible, but direct DB update is safer for sync
    // Better-Auth might have its own internal user store management, but we are sharing the collection.

    revalidatePath("/admin/profile");
    revalidatePath("/admin");

    return { success: true, imageUrl };
  } catch (error) {
    console.error("Upload Error:", error);
    return { error: "Failed to upload image" };
  }
}
