import mongoose from "mongoose";

const InvitationSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "editor", "viewer"],
            default: "viewer",
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        inviterId: {
            type: String, // User ID of the person inviting
        },
        expiresAt: {
            type: Date,
            required: true,
        },
    },
    { timestamps: true }
);

// Delete automatically after expiry (if supported by MongoDB TTL)
InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Invitation ||
    mongoose.model("Invitation", InvitationSchema);
