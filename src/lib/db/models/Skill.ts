import mongoose, { Schema, Document } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: string;
  proficiency: number; // 0-100
  icon?: string; // Lucide icon name or URL
  featured: boolean;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true }, // e.g., "Frontend", "Backend", "AI"
    proficiency: { type: Number, min: 0, max: 100, default: 0 },
    icon: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Skill ||
  mongoose.model<ISkill>("Skill", SkillSchema);
