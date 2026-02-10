"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowRightLeft, 
  PieChart, 
  PiggyBank, 
  CreditCard 
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const navItems = [
    { name: "Dashboard", href: "/admin/finance", icon: LayoutDashboard },
    { name: "Transactions", href: "/admin/finance/transactions", icon: ArrowRightLeft },
    { name: "Accounts", href: "/admin/finance/accounts", icon: Wallet },
    { name: "Budgets", href: "/admin/finance/budgets", icon: PiggyBank },
    { name: "Analytics", href: "/admin/finance/analytics", icon: PieChart },
    { name: "Assets", href: "/admin/finance/investments", icon: CreditCard }, // Renamed Loans to Assets/Investments for now or added new
  ];

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold tracking-tight mb-4">Finance Command Center</h1>
        <div className="flex space-x-1 overflow-x-auto pb-2 relatives">
          {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
                <Link key={item.href} href={item.href} className="relative">
                  <Button 
                    variant={isActive ? "secondary" : "ghost"} 
                    size="sm" 
                    className="flex items-center gap-2 relative z-10 transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                  {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute inset-0 bg-muted rounded-md -z-0"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                  )}
                </Link>
             )
          })}
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
            {children}
        </ScrollArea>
      </div>
    </div>
  );
}
