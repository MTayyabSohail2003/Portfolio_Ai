'use client'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useState } from "react";

// Placeholder data - Server actions to be implemented
const loans = [
    { id: 1, person: "John Doe", amount: 500, type: "LENT", status: "ACTIVE", dueDate: "2024-02-01" },
    { id: 2, person: "Jane Smith", amount: 1200, type: "BORROWED", status: "ACTIVE", dueDate: "2024-03-15" },
];

export default function LoansPage() {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Loans & Debts</h2>
                <Button><Plus className="mr-2 h-4 w-4"/> Add Record</Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50/20">
                    <CardHeader>
                        <CardTitle className="text-green-700">You are owed</CardTitle>
                        <CardDescription>Total people owe you</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-700">$500.00</div>
                    </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50/20">
                     <CardHeader>
                        <CardTitle className="text-red-700">You owe</CardTitle>
                        <CardDescription>Total you owe others</CardDescription>
                    </CardHeader>
                     <CardContent>
                        <div className="text-3xl font-bold text-red-700">$1,200.00</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loans.map(loan => (
                    <Card key={loan.id} className="relative">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-lg">{loan.person}</CardTitle>
                                    <span className={`text-xs px-2 py-1 rounded-full ${loan.type === "LENT" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                                        {loan.type === "LENT" ? "Owes You" : "You Owe"}
                                    </span>
                                </div>
                                {loan.type === "LENT" ? <ArrowUpRight className="text-green-500"/> : <ArrowDownLeft className="text-red-500"/>}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold mb-2">${loan.amount}</div>
                            <p className="text-xs text-muted-foreground">Due: {loan.dueDate}</p>
                            <Button variant="outline" size="sm" className="w-full mt-4">Settle Up</Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
