"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import FinanceAccount, {
  IFinanceAccount,
} from "@/lib/db/models/finance/FinanceAccount";
import Transaction, { ITransaction } from "@/lib/db/models/finance/Transaction";
import FinanceCategory, {
  IFinanceCategory,
} from "@/lib/db/models/finance/FinanceCategory";
import Budget, { IBudget } from "@/lib/db/models/finance/Budget";
import { revalidatePath } from "next/cache";
import nodemailer from "nodemailer";
import { predictCategory } from "@/lib/ai/finance";

// --- ACCOUNTS ---

export async function getAccounts() {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const accounts = await FinanceAccount.find({
      userId: session.user.id,
    }).sort({ balance: -1 });
    return { success: true, data: JSON.parse(JSON.stringify(accounts)) };
  } catch (e) {
    return { error: "Failed to fetch accounts" };
  }
}

export async function createAccount(formData: FormData) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const newAccount = await FinanceAccount.create({
      userId: session.user.id,
      name: formData.get("name") as string,
      type: formData.get("type") as
        | "CASH"
        | "BANK"
        | "INVESTMENT"
        | "CREDIT"
        | "LOAN"
        | "OTHER",
      balance: Number(formData.get("balance")),
      currency: (formData.get("currency") as string) || "USD",
      color: (formData.get("color") as string) || "#000000",
    });
    revalidatePath("/admin/finance/accounts");
    return { success: true, data: JSON.parse(JSON.stringify(newAccount)) };
  } catch (e) {
    return { error: "Failed to create account" };
  }
}

// --- TRANSACTIONS ---

export async function getTransactions(limit = 50) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const txs = await Transaction.find({ userId: session.user.id })
      .sort({ date: -1 })
      .limit(limit)
      .populate("categoryId") // Assuming we want populated data
      .lean();

    // Manual mapping if needed, or return raw
    return { success: true, data: JSON.parse(JSON.stringify(txs)) };
  } catch (e) {
    return { error: "Failed to fetch transactions" };
  }
}

export async function createTransaction(formData: FormData) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const amount = Number(formData.get("amount"));
  const type = formData.get("type");
  const accountId = formData.get("accountId");
  const description = formData.get("description") as string;
  let categoryId = formData.get("categoryId") as string;

  if (!accountId) return { error: "Account ID required" };

  try {
    // AI Categorization Hook
    if ((!categoryId || categoryId === "other") && description) {
      // Try to predict
      const prediction = await predictCategory(description, session.user.id);
      if (prediction && prediction.categoryName) {
        // Find the category by name
        const matchedCategory = await FinanceCategory.findOne({
          userId: session.user.id,
          name: { $regex: new RegExp(`^${prediction.categoryName}$`, "i") },
        });

        if (matchedCategory) {
          categoryId = matchedCategory._id.toString();
        } else if (prediction.isNewCategory) {
          // Determine type based on Tx Type, fallback to deduction
          const catType = type === "INCOME" ? "INCOME" : "EXPENSE"; // Simple mapping
          const newCat = await FinanceCategory.create({
            userId: session.user.id,
            name: prediction.categoryName,
            type: catType,
            color: prediction.suggestedColor || "#64748b",
          });
          categoryId = newCat._id.toString();
        }
      }
    }

    // 1. Create Tx
    const tx = await Transaction.create({
      userId: session.user.id,
      description,
      amount,
      type: type as "INCOME" | "EXPENSE" | "TRANSFER",
      accountId: accountId as string,
      categoryId: categoryId === "other" ? undefined : (categoryId as string),
      date: formData.get("date")
        ? new Date(formData.get("date") as string)
        : new Date(),
      status: "COMPLETED",
    });

    // 2. Update Account Balance
    // Income adds to balance, Expense subtracts
    const adjustment = type === "INCOME" ? amount : -amount;

    const account = await FinanceAccount.findByIdAndUpdate(
      accountId,
      { $inc: { balance: adjustment } },
      { new: true }
    );

    revalidatePath("/admin/finance/transactions");
    revalidatePath("/admin/finance");

    return { success: true };
  } catch (e) {
    return { error: "Failed to create transaction" };
  }
}

// --- CATEGORIES ---

export async function getCategories() {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    // Default / System categories? For now just user's
    const categories = await FinanceCategory.find({ userId: session.user.id });
    return { success: true, data: JSON.parse(JSON.stringify(categories)) };
  } catch (e) {
    return { error: "Failed to fetch categories" };
  }
}

export async function createCategory(formData: FormData) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    await FinanceCategory.create({
      userId: session.user.id,
      name: formData.get("name") as string,
      type: formData.get("type") as "INCOME" | "EXPENSE" | "TRANSFER",
      color: (formData.get("color") as string) || "#000000",
      icon: (formData.get("icon") as string) || "Circle",
    });
    revalidatePath("/admin/finance");
    return { success: true };
  } catch (e) {
    return { error: "Failed to create category" };
  }
}

// --- ANALYTICS ---

export async function getFinanceStats() {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  const userId = session.user.id;

  try {
    // 1. Calculate Monthly Cash Flow (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const cashFlow = await Transaction.aggregate([
      { $match: { userId, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
            type: "$type",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Transform for Recharts: [{ name: "Jan", income: 500, expense: 200 }]
    const chartDataMap = new Map();
    cashFlow.forEach((item: any) => {
      const key = `${item._id.month}/${item._id.year}`;
      if (!chartDataMap.has(key)) {
        chartDataMap.set(key, { name: key, income: 0, expense: 0 });
      }
      const entry = chartDataMap.get(key);
      if (item._id.type === "INCOME") entry.income = item.total;
      if (item._id.type === "EXPENSE") entry.expense = item.total;
    });
    const cashFlowData = Array.from(chartDataMap.values());

    // 2. Spending by Category (This Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    const categorySpend = await Transaction.aggregate([
      { $match: { userId, type: "EXPENSE", date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: "$categoryId",
          value: { $sum: "$amount" },
        },
      },
    ]);

    // Populate Category Names
    const populatedCategorySpend = await FinanceCategory.populate(
      categorySpend,
      { path: "_id", select: "name color" }
    );
    const pieData = populatedCategorySpend.map((item: any) => ({
      name: item._id?.name || "Uncategorized",
      value: item.value,
      fill: item._id?.color || "#94a3b8",
    }));

    return {
      success: true,
      data: { cashFlow: cashFlowData, categorySpend: pieData },
    };
  } catch (e) {
    console.error("Stats Error", e);
    return { error: "Failed to fetch stats" };
  }
}

// --- IMPORT ---

export async function bulkImportTransactions(data: any[], accountId: string) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const txs = data.map((row) => ({
      userId: session.user.id,
      accountId,
      date: new Date(row.date),
      description: row.description,
      amount: Math.abs(parseFloat(row.amount)), // Normalize absolute value
      type: parseFloat(row.amount) < 0 ? "EXPENSE" : "INCOME", // Deduce type if simple number
      categoryId: null, // Let AI categorize later or leave blank
      status: "COMPLETED",
    }));

    const result = await Transaction.insertMany(txs);

    // Update Balance
    const total = txs.reduce((acc, curr) => {
      return acc + (curr.type === "INCOME" ? curr.amount : -curr.amount);
    }, 0);

    await FinanceAccount.findByIdAndUpdate(accountId, {
      $inc: { balance: total },
    });

    revalidatePath("/admin/finance");
    return { success: true, count: result.length };
  } catch (e) {
    console.error("Import Error", e);
    return { error: "Failed to import transactions" };
  }
}

// --- INVOICES ---

export async function sendInvoiceEmail(transactionId: string) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const tx = await Transaction.findById(transactionId);
    if (!tx) return { error: "Transaction not found" };

    const transporter = (nodemailer as any).createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Simple HTML Invoice
    const html = `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; max-width: 600px; margin: 0 auto;">
                <h1>INVOICE</h1>
                <p><strong>Ref:</strong> ${tx._id}</p>
                <p><strong>Date:</strong> ${new Date(
      tx.date
    ).toLocaleDateString()}</p>
                <hr />
                <p><strong>Description:</strong> ${tx.description}</p>
                <h2>Total: $${tx.amount.toFixed(2)}</h2>
                <hr />
                <p>Thank you for your business.</p>
            </div>
        `;

    // Send to self or configured client email (hardcoded for now as placeholders)
    // In real app, we'd have a Client Model.
    const recipient = "client@example.com";

    await transporter.sendMail({
      from: `"Finance System" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject: `Invoice from ${session.user.name} - ${tx.description}`,
      html: html,
    });

    return { success: true };
  } catch (e) {
    console.error("Email Error", e);
    return { error: "Failed to send invoice" };
  }
}

// --- BUDGETS ---

export async function getBudgets() {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const budgets = await Budget.find({ userId: session.user.id, isActive: true })
      .populate("categoryId")
      .lean();

    // Calculate spent amount for each budget
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const budgetsWithSpent = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      budgets.map(async (budget: any) => {
        let dateFilter: Record<string, Date> = {};
        if (budget.period === "MONTHLY") {
          dateFilter = { $gte: startOfMonth };
        } else if (budget.period === "YEARLY") {
          dateFilter = { $gte: startOfYear };
        }

        // Get category ID (it's populated, so we need the _id)
        const categoryIdStr = budget.categoryId?._id?.toString() || budget.categoryId?.toString();

        const transactions = await Transaction.find({
          userId: session.user.id,
          categoryId: categoryIdStr,
          type: "EXPENSE",
          ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
        });

        const spent = transactions.reduce((sum, tx) => sum + tx.amount, 0);

        return {
          ...budget,
          _id: budget._id?.toString(),
          spent,
          category: budget.categoryId?.name || "Unknown",
          color: budget.categoryId?.color || "#64748b",
        };
      })
    );

    return { success: true, data: JSON.parse(JSON.stringify(budgetsWithSpent)) };
  } catch (e) {
    console.error("Get Budgets Error", e);
    return { error: "Failed to fetch budgets" };
  }
}

export async function createBudget(formData: FormData) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const categoryId = formData.get("categoryId") as string;
    const amount = Number(formData.get("amount"));

    if (!categoryId || categoryId.trim() === "") {
      return { error: "Please select a category" };
    }

    if (!amount || amount <= 0) {
      return { error: "Please enter a valid budget amount" };
    }

    const budget = await Budget.create({
      userId: session.user.id,
      categoryId,
      amount,
      period: (formData.get("period") as string) || "MONTHLY",
      alertsThreshold: Number(formData.get("alertsThreshold")) || 80,
      isActive: true,
    });

    revalidatePath("/admin/finance/budgets");
    return { success: true, data: JSON.parse(JSON.stringify(budget)) };
  } catch (e) {
    console.error("Create Budget Error", e);
    return { error: "Failed to create budget" };
  }
}

export async function deleteBudget(budgetId: string) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    await Budget.findByIdAndUpdate(budgetId, { isActive: false });
    revalidatePath("/admin/finance/budgets");
    return { success: true };
  } catch (e) {
    console.error("Delete Budget Error", e);
    return { error: "Failed to delete budget" };
  }
}
