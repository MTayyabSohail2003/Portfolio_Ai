import mongoose from "mongoose";

const ColumnSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    type: {
      type: String,
      enum: ["todo", "in-progress", "done", "custom"],
      default: "custom",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Column || mongoose.model("Column", ColumnSchema);
