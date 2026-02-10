import mongoose, { Schema, Document } from "mongoose";

export interface IEducation extends Document {
  degree: string;
  institution: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status: string; // "Completed", "In Progress"
  description?: string;
}

const EducationSchema = new Schema<IEducation>(
  {
    degree: { type: String, required: true },
    institution: { type: String, required: true },
    location: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, default: "Completed" },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Education ||
  mongoose.model<IEducation>("Education", EducationSchema);
