import mongoose from "mongoose";

const WorkspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a workspace name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    owner: {
      type: String, // User ID (auth key)
      required: true,
    },
    members: [
      {
        userId: String,
        role: {
          type: String,
          enum: ["admin", "editor", "viewer"],
          default: "viewer",
        },
      },
    ],
    description: String,
  },
  { timestamps: true }
);

export default mongoose.models.Workspace ||
  mongoose.model("Workspace", WorkspaceSchema);
