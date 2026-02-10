import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connect";
import SiteAnalytics from "@/lib/db/models/SiteAnalytics";

export async function POST() {
  try {
    await dbConnect();

    // Increment total_views safely
    await SiteAnalytics.findOneAndUpdate(
      { metric: "total_views" },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record view:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
