import { getFinanceStats } from "@/app/actions/finance-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowChart } from "../cash-flow-chart";
import { SpendingPieChart } from "../spending-pie-chart";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/admin/date-range-picker"; // Assuming this exists or generic
import { Download } from "lucide-react";

export default async function AnalyticsPage() {
  const { data: stats } = await getFinanceStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Financial Analytics</h2>
            <p className="text-muted-foreground">Deep dive into your spending and income trends.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export Report
            </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income (Adjusted)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                        ${stats?.cashFlow?.reduce((sum: number, item: any) => sum + (item.income || 0), 0).toLocaleString()}
                    </div>
                </CardContent>
           </Card>
           <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                        ${stats?.cashFlow?.reduce((sum: number, item: any) => sum + (item.expense || 0), 0).toLocaleString()}
                    </div>
                </CardContent>
           </Card>
           <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="text-2xl font-bold">
                        ${(stats?.cashFlow?.reduce((sum: number, item: any) => sum + (item.income || 0), 0) - stats?.cashFlow?.reduce((sum: number, item: any) => sum + (item.expense || 0), 0)).toLocaleString()}
                    </div>
                </CardContent>
           </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Cash Flow Trends</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <CashFlowChart data={stats?.cashFlow || []} />
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendingPieChart data={stats?.categorySpend || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
