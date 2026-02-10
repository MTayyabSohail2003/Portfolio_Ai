"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Landmark, TrendingUp, CreditCard } from "lucide-react";

interface Account {
  _id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export function AccountsSummary({ accounts }: { accounts: Account[] }) {
  if (accounts.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">No accounts found.</p>
            <p className="text-sm text-muted-foreground">Create your first account to start tracking your finances.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const cashBalance = accounts
    .filter((a) => a.type === "CASH")
    .reduce((sum, acc) => sum + acc.balance, 0);
  const bankBalance = accounts
    .filter((a) => a.type === "BANK")
    .reduce((sum, acc) => sum + acc.balance, 0);
  const investBalance = accounts
    .filter((a) => a.type === "INVESTMENT")
    .reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Net Worth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-xs text-muted-foreground">
            Across all {accounts.length} accounts
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash On Hand</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(cashBalance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Bank Accounts</CardTitle>
          <Landmark className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(bankBalance)}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Investments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(investBalance)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
