import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  accountId: string; // The account money comes FROM (or goes TO for income)
  toAccountId?: string; // For transfers only
  categoryId?: string;
  amount: number;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  date: Date;
  description?: string;
  tags: string[];
  status: "COMPLETED" | "PENDING";
  snapshotBalance?: number; // Balance of accountId AFTER this tx
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    accountId: { type: String, required: true, index: true },
    toAccountId: { type: String }, // Optional, for Transfer
    categoryId: { type: String, index: true }, // Optional for Transfers
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE", "TRANSFER"],
      required: true,
    },
    date: { type: Date, default: Date.now },
    description: { type: String },
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["COMPLETED", "PENDING"],
      default: "COMPLETED",
    },
    snapshotBalance: { type: Number },
  },
  { timestamps: true }
);

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
