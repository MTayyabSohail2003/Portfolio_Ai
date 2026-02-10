import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  order: number;
  boardId: mongoose.Schema.Types.ObjectId;
  columnId: string;
  assignees?: mongoose.Schema.Types.ObjectId[];
  tags: string[];
  dueDate?: Date;
  subtasks: { title: string; completed: boolean }[];
  aiTags?: string[];
}

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    status: { type: String, required: true, default: "todo" },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    order: { type: Number, default: 0 },
    boardId: { type: Schema.Types.ObjectId, ref: "Board", required: true },
    columnId: { type: String, required: true }, // Matches Board.columns[].id
    assignees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    tags: [String],
    dueDate: Date,
    subtasks: [
      {
        title: String,
        completed: { type: Boolean, default: false },
      },
    ],
    aiTags: [String],
  },
  { timestamps: true }
);

export default mongoose.models.Task ||
  mongoose.model<ITask>("Task", TaskSchema);
