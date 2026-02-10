
import { getTransactions, getAccounts, getCategories } from "@/app/actions/finance-actions";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { TransactionTable } from "./transaction-table";
import { ImportDialog } from "./import-dialog";

export default async function TransactionsPage() {
  const [{ data: transactions }, { data: accounts }, { data: categories }] = await Promise.all([
    getTransactions(100),
    getAccounts(),
    getCategories()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-xl font-semibold">Ledger</h2>
            <p className="text-sm text-muted-foreground">Recent transactions across all accounts.</p>
         </div>
         <div className="flex gap-2">
             <ImportDialog accounts={accounts || []} />
             <AddTransactionDialog accounts={accounts || []} categories={categories || []} />
         </div>
      </div>

      <TransactionTable data={transactions || []} />
    </div>
  );
}
