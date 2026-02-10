import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a board name"],
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    key: {
      type: String, // Short identifier like "KAN", "DEV"
      uppercase: true,
      maxlength: 5,
    },
    description: String,
    background: String, // Color or Image URL
    viewPreferences: {
      defaultView: { type: String, enum: ["board", "list"], default: "board" },
      sortBy: { type: String, default: "order" },
      sortDirection: { type: String, enum: ["asc", "desc"], default: "asc" },
    },
    columns: [
      {
        id: { type: String, required: true }, // UUID for drag/drop sync
        title: { type: String, required: true },
        order: { type: Number, default: 0 },
        color: { type: String, default: "#000000" },
        type: {
          type: String,
          enum: ["todo", "doing", "done", "custom", "backlog"],
          default: "custom",
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Board || mongoose.model("Board", BoardSchema);
