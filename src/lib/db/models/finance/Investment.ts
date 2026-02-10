import mongoose from "mongoose";

const InvestmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide an asset name"],
    },
    symbol: {
      type: String,
      uppercase: true,
    },
    type: {
      type: String,
      enum: ["STOCK", "CRYPTO", "REAL_ESTATE", "ETF", "CASH", "OTHER"],
      default: "STOCK",
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    avgCost: {
      type: Number,
      required: true,
      default: 0,
    },
    currentPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    currency: {
      type: String,
      default: "USD",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Investment ||
  mongoose.model("Investment", InvestmentSchema);
