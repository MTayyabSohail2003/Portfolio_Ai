import mongoose, { Schema, Model, Document } from "mongoose";

export interface IBudget extends Document {
  userId: string;
  categoryId: string; // Providing a budget for a specific category
  amount: number; // Limit amount
  period: "MONTHLY" | "YEARLY" | "ONE_TIME";
  alertsThreshold: number; // e.g., 80 for 80%
  isActive: boolean;
}

const BudgetSchema = new Schema<IBudget>(
  {
    userId: { type: String, required: true, index: true },
    categoryId: { type: String, required: true },
    amount: { type: Number, required: true },
    period: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "ONE_TIME"],
      default: "MONTHLY",
    },
    alertsThreshold: { type: Number, default: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Budget: Model<IBudget> =
  mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);

export default Budget;
