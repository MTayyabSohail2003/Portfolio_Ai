import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { AddInvestmentDialog } from "./add-investment-dialog";
import { getInvestments, getPortfolioStats, deleteInvestment } from "@/app/actions/investment-actions";
import { SpendingPieChart } from "../spending-pie-chart"; // Reuse or create new one
import { DeleteButton } from "./delete-button"; // Client component
import { formatCurrency } from "@/lib/utils";

export default async function InvestmentsPage() {
    const [{ data: investments }, { data: stats }] = await Promise.all([
        getInvestments(),
        getPortfolioStats()
    ]);

    const overallProfit = stats?.profit || 0;
    const profitPercent = stats?.profitPercent || 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                 <div>
                     <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Investment Portfolio</h2>
                     <p className="text-muted-foreground">Real-time asset tracking and performance analysis.</p>
                </div>
                <div className="flex gap-2">
                     <Button variant="outline" size="icon"><RefreshCcw className="h-4 w-4" /></Button>
                     <AddInvestmentDialog />
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                 <Card className="bg-gradient-to-br from-background to-muted/50 border-emerald-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Value</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold text-primary">{formatCurrency(stats?.totalValue || 0)}</div></CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-background to-muted/50 border-emerald-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Cost</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">{formatCurrency(stats?.totalCost || 0)}</div></CardContent>
                </Card>
                 <Card className="bg-gradient-to-br from-background to-muted/50 border-emerald-500/20">
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Total Profit</CardTitle></CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-bold ${overallProfit >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {overallProfit >= 0 ? "+" : "-"}{formatCurrency(Math.abs(overallProfit))}
                        </div>
                         <p className={`text-xs ${overallProfit >= 0 ? "text-green-500" : "text-red-500"} flex items-center mt-1`}>
                            {overallProfit >= 0 ? <TrendingUp className="h-3 w-3 mr-1"/> : <TrendingDown className="h-3 w-3 mr-1"/>}
                            {profitPercent.toFixed(2)}% All Time
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
                {/* Assets List */}
                <div className="space-y-4">
                     {investments?.map((inv: any) => {
                         const val = inv.quantity * inv.currentPrice;
                         const gain = val - (inv.quantity * inv.avgCost);
                         const gainPercent = inv.avgCost > 0 ? (gain / (inv.quantity * inv.avgCost)) * 100 : 0;

                         return (
                            <Card key={inv._id} className="group hover:shadow-md transition-all duration-300 border-l-4" style={{ borderLeftColor: getColorForType(inv.type) }}>
                                <CardContent className="flex items-center justify-between p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-muted h-12 w-12 flex items-center justify-center font-bold text-lg shadow-inner">
                                            {inv.symbol?.[0] || inv.name[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold text-lg">{inv.name}</h3>
                                                {inv.symbol && <span className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{inv.symbol}</span>}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{inv.quantity} units @ {formatCurrency(inv.avgCost)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-bold text-lg">{formatCurrency(val)}</div>
                                            <div className={`text-sm font-medium ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                                                {gain >= 0 ? "+" : "-"}{formatCurrency(Math.abs(gain))} ({gainPercent.toFixed(2)}%)
                                            </div>
                                        </div>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                             <DeleteButton id={inv._id} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                         )
                     })}
                     {(!investments || investments.length === 0) && (
                         <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                             No assets found. Start building your portfolio!
                         </div>
                     )}
                </div>

                {/* Sidebar Charts */}
                <div className="space-y-6">
                     <Card>
                         <CardHeader><CardTitle>Allocation</CardTitle></CardHeader>
                         <CardContent>
                             <SpendingPieChart data={stats?.allocation || []} />
                         </CardContent>
                     </Card>
                </div>
            </div>
        </div>
    )
}

function getColorForType(type: string) {
    switch (type) {
        case "STOCK": return "#3b82f6"; // Blue
        case "CRYPTO": return "#f59e0b"; // Orange
        case "REAL_ESTATE": return "#10b981"; // Green
        case "ETF": return "#8b5cf6"; // Purple
        case "CASH": return "#64748b"; // Slate
        default: return "#ef4444"; // Red
    }
}
