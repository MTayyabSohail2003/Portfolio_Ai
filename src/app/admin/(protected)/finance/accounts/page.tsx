
import { getAccounts } from "@/app/actions/finance-actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AddAccountDialog } from "./add-account-dialog"; // to be created

export default async function AccountsPage() {
  const { data: accounts } = await getAccounts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <h2 className="text-xl font-semibold">Your Accounts</h2>
         <AddAccountDialog /> 
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts?.map((acc: any) => (
            <Card key={acc._id} className="relative overflow-hidden border-l-4" style={{ borderLeftColor: acc.color }}>
                <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center text-lg">
                        {acc.name}
                        <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-muted rounded-full">
                            {acc.type}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: acc.currency }).format(acc.balance)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Last updated: {new Date(acc.updatedAt).toLocaleDateString()}</p>
                </CardContent>
            </Card>
        ))}
        {(!accounts || accounts.length === 0) && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
                No accounts found. Create one to get started.
            </div>
        )}
      </div>
    </div>
  );
}
