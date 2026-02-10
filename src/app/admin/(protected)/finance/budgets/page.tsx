
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { getBudgets, getCategories } from "@/app/actions/finance-actions";
import { AddBudgetDialog } from "./add-budget-dialog";

interface Budget {
    _id: string;
    category: string;
    spent: number;
    amount: number;
    period: string;
    color: string;
}

export default async function BudgetsPage() {
    const [{ data: budgets }, { data: categories }] = await Promise.all([
        getBudgets(),
        getCategories()
    ]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Budgeting</h2>
                    <p className="text-muted-foreground">Track your spending limits.</p>
                </div>
                <AddBudgetDialog categories={categories || []} />
            </div>

            {(!budgets || budgets.length === 0) ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                            <p className="text-muted-foreground">No budgets set yet.</p>
                            <p className="text-sm text-muted-foreground">
                                Create your first budget to start tracking your spending limits.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {budgets.map((budget: Budget) => {
                        const percent = (budget.spent / budget.amount) * 100;
                        const isOver = percent > 100;

                        return (
                            <Card key={budget._id} className={isOver ? "border-red-500 shadow-md shadow-red-100" : ""}>
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-lg">{budget.category}</CardTitle>
                                        <span className="text-xs bg-muted px-2 py-1 rounded">{budget.period}</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>${budget.spent.toFixed(2)} spent</span>
                                        <span className="font-semibold text-muted-foreground">of ${budget.amount.toFixed(2)}</span>
                                    </div>
                                    <Progress
                                        value={percent > 100 ? 100 : percent}
                                        className="h-2"
                                        indicatorColor={budget.color}
                                    />
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">{percent.toFixed(0)}% used</span>
                                        {isOver ? (
                                            <div className="flex items-center text-red-600 text-xs font-bold">
                                                <AlertTriangle className="h-3 w-3 mr-1" /> Over Limit
                                            </div>
                                        ) : (
                                            <div className="flex items-center text-green-600 text-xs font-bold">
                                                <CheckCircle className="h-3 w-3 mr-1" /> On Track
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
