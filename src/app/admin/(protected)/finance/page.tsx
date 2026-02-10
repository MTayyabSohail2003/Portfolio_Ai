import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAccounts, getTransactions, getFinanceStats } from "@/app/actions/finance-actions";
import { AccountsSummary } from "./accounts-summary";
import { CashFlowChart } from "./cash-flow-chart";
import { SpendingPieChart } from "./spending-pie-chart";
import { FinanceChat } from "./finance-chat";

// ... existing code ...

export default async function FinanceDashboard() {
  const [{ data: accounts }, { data: stats }, { data: recentTxs }] = await Promise.all([
    getAccounts(),
    getFinanceStats(),
    getTransactions(5)
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Finance Overview</h2>
        <div className="flex gap-2">
          <Link href="/admin/finance/transactions">
            <Button>Record Transaction</Button>
          </Link>
        </div>
      </div>

      <AccountsSummary accounts={accounts || []} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={stats?.cashFlow || []} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingPieChart data={stats?.categorySpend || []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        {/* Recent Activity Card ... */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTxs?.map((tx: any) => (
                <div key={tx._id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-bold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-md'}`}>
                    {tx.type === 'EXPENSE' ? '-' : '+'}${tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CFO Agent Chat */}
        <div className="col-span-1">
          <FinanceChat />
        </div>
      </div>
    </div>
  );
}
