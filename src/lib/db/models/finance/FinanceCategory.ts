import mongoose, { Schema, Model, Document } from "mongoose";

export interface IFinanceCategory extends Document {
  userId: string;
  name: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  icon?: string; // Lucide icon name or emoji
  color?: string;
  parentId?: string; // For nested categories
  isArchived: boolean;
}

const FinanceCategorySchema = new Schema<IFinanceCategory>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE", "TRANSFER"],
      required: true,
    },
    icon: { type: String },
    color: { type: String },
    parentId: { type: String, default: null },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const FinanceCategory: Model<IFinanceCategory> =
  mongoose.models.FinanceCategory ||
  mongoose.model<IFinanceCategory>("FinanceCategory", FinanceCategorySchema);

export default FinanceCategory;
