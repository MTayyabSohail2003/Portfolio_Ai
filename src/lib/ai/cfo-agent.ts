import { openai, AI_MODELS } from "./provider";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import FinanceAccount from "@/lib/db/models/finance/FinanceAccount";
import Transaction from "@/lib/db/models/finance/Transaction";
import FinanceCategory from "@/lib/db/models/finance/FinanceCategory";
import dbConnect from "@/lib/db/connect";

// --- TOOLS ---

const GetBalanceSchema = z.object({});
async function getBalanceTool(userId: string) {
  await dbConnect();
  const accounts = await FinanceAccount.find({ userId });
  const total = accounts.reduce(
    (sum: number, acc: any) => sum + acc.balance,
    0
  );
  const breakdown = accounts
    .map((a: any) => `${a.name}: $${a.balance}`)
    .join(", ");
  return { total, breakdown };
}

const GetSpendingSchema = z.object({
  period: z
    .enum(["this_month", "last_month", "all_time"])
    .default("this_month"),
});
async function getSpendingTool(
  args: z.infer<typeof GetSpendingSchema>,
  userId: string
) {
  await dbConnect();
  const now = new Date();
  let startDate = new Date();

  if (args.period === "this_month") {
    startDate.setDate(1);
  } else if (args.period === "last_month") {
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(1);
  } else {
    startDate = new Date(0); // All time
  }

  const txs = await Transaction.find({
    userId,
    type: "EXPENSE",
    date: { $gte: startDate },
  }).populate("categoryId");

  const total = txs.reduce((sum: number, t: any) => sum + t.amount, 0);

  // Group by Category
  const byCategory: Record<string, number> = {};
  txs.forEach((t: any) => {
    const catName = t.categoryId?.name || "Uncategorized";
    byCategory[catName] = (byCategory[catName] || 0) + t.amount;
  });

  return {
    period: args.period,
    total,
    topCategories: Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, amount]) => `${name}: $${amount}`),
  };
}

// --- AGENT ---

export async function runFinanceAgent(
  history: any[],
  newMessage: string,
  userId: string
) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are the CFO Agent. You have access to the user's live financial data. Use tools to answer questions. Be concise and professional.",
      },
      ...history,
      { role: "user", content: newMessage },
    ];

    // 1. First Pass: Call Model to decide on tools
    const runner = await openai.chat.completions.create({
      model: AI_MODELS.chat,
      messages: messages,
      tools: [
        {
          type: "function",
          function: {
            name: "get_balance",
            description: "Get current total net worth and account breakdown",
            parameters: zodResponseFormat(GetBalanceSchema, "get_balance")
              .json_schema,
          },
        },
        {
          type: "function",
          function: {
            name: "get_spending",
            description: "Analyze spending for a specific period",
            parameters: zodResponseFormat(GetSpendingSchema, "get_spending")
              .json_schema,
          },
        },
      ] as any,
      tool_choice: "auto",
    });

    const msg = runner.choices[0].message;

    // 2. Client-side tool execution loop (Server-side here)
    if (msg.tool_calls && msg.tool_calls.length > 0) {
      messages.push(msg as any); // Add assistant's tool call request

      for (const toolCall of msg.tool_calls) {
        let toolResult = "";

        // Explicit check to satisfy TS if needed, usually 'function' exists on tool_calls items
        if (toolCall.type === "function" && toolCall.function) {
          if (toolCall.function.name === "get_balance") {
            const result = await getBalanceTool(userId);
            toolResult = JSON.stringify(result);
          } else if (toolCall.function.name === "get_spending") {
            const args = JSON.parse(toolCall.function.arguments);
            const result = await getSpendingTool(args, userId);
            toolResult = JSON.stringify(result);
          }

          messages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: toolResult,
          });
        }
      }

      // 3. Second Pass: Get final answer based on tool outputs
      const final = await openai.chat.completions.create({
        model: AI_MODELS.chat,
        messages: messages as any,
      });

      return final.choices[0].message.content;
    }

    return msg.content; // No tool called, just conversation
  } catch (e) {
    console.error("Agent Error", e);
    return "I encountered an error accessing your financial data.";
  }
}
