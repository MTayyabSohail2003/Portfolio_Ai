import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import dbConnect from "@/lib/db/connect";
import FinanceAccount from "@/lib/db/models/finance/FinanceAccount";
import Transaction from "@/lib/db/models/finance/Transaction";
import User from "@/lib/db/models/User"; // Assuming User model

// --- SCHEMAS ---

const GetFinanceStatsSchema = z.object({
  metric: z.enum(["net_worth", "cash_flow", "spending_breakdown"]),
});

const ManageUserSchema = z.object({
  action: z.enum(["list", "count"]),
});

// --- TOOLS ---

export const superAdminTools = [
  {
    type: "function",
    function: {
      name: "get_finance_stats",
      description:
        "Get high-level financial statistics (Net Worth, Cash Flow). Protected: Super Admin Only.",
      parameters: zodResponseFormat(GetFinanceStatsSchema, "get_finance_stats")
        .json_schema,
    },
  },
  {
    type: "function",
    function: {
      name: "manage_users",
      description: "Inspect system users.",
      parameters: zodResponseFormat(ManageUserSchema, "manage_users")
        .json_schema,
    },
  },
];

// --- IMPLEMENTATION ---

export async function handleSuperAdminTools(
  name: string,
  args: any,
  userId: string
) {
  await dbConnect();

  if (name === "get_finance_stats") {
    // Reuse logic from cfo-agent or call it directly if exported
    // For now, inline the aggregation for speed
    if (args.metric === "net_worth") {
      const accounts = await FinanceAccount.find({}); // Super Admin sees ALL? Or just theirs? Assuming theirs for now or all if system owner.
      // Let's assume userId is the system owner.
      const total = accounts.reduce(
        (acc: number, curr: any) => acc + curr.balance,
        0
      );
      return `Total Net Worth: $${total.toLocaleString()}`;
    }
    if (args.metric === "cash_flow") {
      // Simple Income vs Expense this month
      const start = new Date();
      start.setDate(1);
      const txs = await Transaction.find({ date: { $gte: start } });
      const income = txs
        .filter((t: any) => t.type === "INCOME")
        .reduce((s: number, t: any) => s + t.amount, 0);
      const expense = txs
        .filter((t: any) => t.type === "EXPENSE")
        .reduce((s: number, t: any) => s + t.amount, 0);
      return `This Month - Income: $${income}, Expenses: $${expense}, Net: $${
        income - expense
      }`;
    }
  }

  if (name === "manage_users") {
    if (args.action === "count") {
      const count = await User.countDocuments();
      return `Total System Users: ${count}`;
    }
    if (args.action === "list") {
      const users = await User.find()
        .select("name email role createdAt")
        .limit(10);
      return JSON.stringify(users);
    }
  }

  return null;
}
