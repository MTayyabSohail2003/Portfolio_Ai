import mongoose, { Schema, Model, Document } from "mongoose";

// Tracks debts (I owe someone) or loans (someone owes me)
export interface ILoan extends Document {
  userId: string;
  personName: string;
  amount: number; // Current outstanding balance
  totalAmount: number; // Original amount
  type: "LENT" | "BORROWED"; // LENT = Asset (They owe me), BORROWED = Liability (I owe them)
  dueDate?: Date;
  interestRate?: number; // Optional percentage
  status: "ACTIVE" | "PAID" | "DEFAULTED";
  notes?: string;
  history: {
    date: Date;
    amount: number;
    action: "PAYMENT" | "INTEREST" | "ADJUSTMENT";
    note?: string;
  }[];
}

const LoanSchema = new Schema<ILoan>(
  {
    userId: { type: String, required: true, index: true },
    personName: { type: String, required: true },
    amount: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    type: { type: String, enum: ["LENT", "BORROWED"], required: true },
    dueDate: { type: Date },
    interestRate: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "PAID", "DEFAULTED"],
      default: "ACTIVE",
    },
    notes: { type: String },
    history: [
      {
        date: { type: Date, default: Date.now },
        amount: { type: Number, required: true },
        action: {
          type: String,
          enum: ["PAYMENT", "INTEREST", "ADJUSTMENT"],
          required: true,
        },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

const Loan: Model<ILoan> =
  mongoose.models.Loan || mongoose.model<ILoan>("Loan", LoanSchema);

export default Loan;
