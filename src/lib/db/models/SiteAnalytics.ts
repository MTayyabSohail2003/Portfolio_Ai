import mongoose, { Schema, Document } from "mongoose";

export interface ISiteAnalytics extends Document {
  metric: string; // e.g., "total_views"
  count: number;
}

const SiteAnalyticsSchema = new Schema<ISiteAnalytics>(
  {
    metric: { type: String, required: true, unique: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.SiteAnalytics ||
  mongoose.model<ISiteAnalytics>("SiteAnalytics", SiteAnalyticsSchema);
