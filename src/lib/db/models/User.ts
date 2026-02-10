import mongoose from "mongoose";

// This model maps to the 'user' collection created by Better-Auth
// We define it here to allow Mongoose queries and GraphQL resolution
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    emailVerified: Boolean,
    image: String, // Ensure we can store/retrieve the profile picture
    createdAt: Date,
    updatedAt: Date,
    role: {
      type: String,
      default: "user",
    },
  },
  { collection: "user" } // Force mapping to 'user' collection
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
