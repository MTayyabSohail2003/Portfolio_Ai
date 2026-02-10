"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/lib/db/connect";
import Investment from "@/lib/db/models/finance/Investment";
import { revalidatePath } from "next/cache";

export async function getInvestments() {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const investments = await Investment.find({ userId: session.user.id }).sort(
      {
        createdAt: -1,
      }
    );
    return { success: true, data: JSON.parse(JSON.stringify(investments)) };
  } catch (e) {
    return { error: "Failed to fetch investments" };
  }
}

export async function createInvestment(formData: FormData) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const newInvestment = await Investment.create({
      userId: session.user.id,
      name: formData.get("name"),
      symbol: formData.get("symbol"),
      type: formData.get("type"),
      quantity: Number(formData.get("quantity")),
      avgCost: Number(formData.get("avgCost")),
      currentPrice: Number(formData.get("currentPrice")),
      currency: formData.get("currency") || "USD",
    });

    revalidatePath("/admin/finance/investments");
    return { success: true, data: JSON.parse(JSON.stringify(newInvestment)) };
  } catch (e) {
    return { error: "Failed to create investment" };
  }
}

export async function deleteInvestment(id: string) {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    await Investment.findByIdAndDelete(id);
    revalidatePath("/admin/finance/investments");
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete investment" };
  }
}

export async function getPortfolioStats() {
  await dbConnect();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Unauthorized" };

  try {
    const investments = await Investment.find({ userId: session.user.id });

    let totalValue = 0;
    let totalCost = 0;
    const allocation: Record<string, number> = {};

    investments.forEach((inv: any) => {
      const val = inv.quantity * inv.currentPrice;
      const cost = inv.quantity * inv.avgCost;

      totalValue += val;
      totalCost += cost;

      // Allocation group by Type
      allocation[inv.type] = (allocation[inv.type] || 0) + val;
    });

    // Convert allocation to chart data
    const allocationData = Object.keys(allocation).map((key) => ({
      name: key,
      value: allocation[key],
      fill: getColorForType(key),
    }));

    return {
      success: true,
      data: {
        totalValue,
        totalCost,
        profit: totalValue - totalCost,
        profitPercent:
          totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
        allocation: allocationData,
      },
    };
  } catch (e) {
    return { error: "Failed to get stats" };
  }
}

function getColorForType(type: string) {
  switch (type) {
    case "STOCK":
      return "#3b82f6"; // Blue
    case "CRYPTO":
      return "#f59e0b"; // Orange
    case "REAL_ESTATE":
      return "#10b981"; // Green
    case "ETF":
      return "#8b5cf6"; // Purple
    case "CASH":
      return "#64748b"; // Slate
    default:
      return "#ef4444"; // Red
  }
}
