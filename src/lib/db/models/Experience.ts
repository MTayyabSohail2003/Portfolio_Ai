import mongoose, { Schema, Document } from "mongoose";

export interface IExperience extends Document {
  position: string;
  company: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  description: string; // Markdown or text
  technologies: string[];
}

const ExperienceSchema = new Schema<IExperience>(
  {
    position: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
    description: { type: String, required: true },
    technologies: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Experience ||
  mongoose.model<IExperience>("Experience", ExperienceSchema);
