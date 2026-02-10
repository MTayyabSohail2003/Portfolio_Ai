"use client";

import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen border-r bg-card transition-[width] duration-300 ease-in-out md:flex",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex w-full flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          {!isCollapsed && (
            <div className="text-xl font-bold tracking-tight text-primary">
              Muhammad Tayyab
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <Menu size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            const LinkComponent = (
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <item.icon size={20} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{LinkComponent}</TooltipTrigger>
                  <TooltipContent side="right">{item.title}</TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{LinkComponent}</div>;
          })}
        </nav>
      </div>
    </aside>
  );
}
