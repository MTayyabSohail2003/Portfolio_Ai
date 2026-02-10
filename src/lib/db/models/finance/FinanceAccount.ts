import mongoose, { Schema, Model, Document } from "mongoose";

export interface IFinanceAccount extends Document {
  userId: string;
  name: string;
  type: "CASH" | "BANK" | "INVESTMENT" | "CREDIT" | "LOAN" | "OTHER";
  balance: number;
  currency: string;
  color: string;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FinanceAccountSchema = new Schema<IFinanceAccount>(
  {
    userId: { type: String, required: true, index: true }, // Clerk/NextAuth User ID
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["CASH", "BANK", "INVESTMENT", "CREDIT", "LOAN", "OTHER"],
      default: "BANK",
    },
    balance: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    color: { type: String, default: "#3b82f6" }, // Default blue
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FinanceAccount: Model<IFinanceAccount> =
  mongoose.models.FinanceAccount ||
  mongoose.model<IFinanceAccount>("FinanceAccount", FinanceAccountSchema);

export default FinanceAccount;
