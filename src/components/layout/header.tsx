"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-client";
import { Loader2, LayoutDashboard, LogOut, LogIn, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { navItems } from "@/components/layout/nav-config";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-8">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="mr-2 dark:bg-slate-800">
                <Menu className="h-5 w-5 mr-2" />
                <span className="font-semibold">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetTitle className="text-lg font-bold text-primary mb-4">
                Menu
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 text-sm font-medium transition-colors hover:text-primary",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      <item.icon size={20} />
                      {item.title}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <Link href="/" className="border border-transparent dark:border-white dark:bg-slate-800 rounded-md px-3 py-1 transition-colors">
            Tayyab.AI
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : session ? (
            <div className="flex items-center gap-2">
              <Link href="/admin/dashboard">
                <Button variant="ghost" size="sm" className="hidden sm:flex border border-transparent dark:border-white dark:bg-slate-800">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button variant="ghost" size="icon" className="sm:hidden border border-transparent dark:border-white dark:bg-slate-800">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline" size="sm" className="hidden sm:flex dark:bg-slate-800">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
              <Button onClick={handleSignOut} variant="outline" size="icon" className="sm:hidden dark:bg-slate-800">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="border border-transparent dark:border-white dark:bg-slate-800">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
