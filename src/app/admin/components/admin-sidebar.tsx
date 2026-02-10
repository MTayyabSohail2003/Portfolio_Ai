"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Code2,
  Briefcase,
  MonitorPlay,
  Image as ImageIcon,
  Database,
  Users,
  PenTool,
  Network,
  LogOut,
  Settings,
  Activity,
  UserCircle,
  Bitcoin,
} from "lucide-react";
import { client } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AdminSidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Hide sidebar on login page
  if (pathname === "/admin") return null;

  const handleSignOut = async () => {
      await client.signOut();
      router.push("/admin");
  };

  const menuItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/workspaces", label: "Workspaces", icon: Briefcase },
    { href: "/admin/projects", label: "Projects", icon: MonitorPlay },
    { href: "/admin/experience", label: "Experience", icon: Briefcase },
    { href: "/admin/skills", label: "Skills", icon: Code2 },
    { href: "/admin/blog/new", label: "Write Blog", icon: PenTool },
    { href: "/admin/media", label: "Media Library", icon: ImageIcon },
    { href: "/admin/brain", label: "Neural Graph", icon: Network },
    { href: "/admin/rag", label: "RAG / Brain", icon: Database },
    { href: "/admin/users", label: "User Management", icon: Users },
    { href: "/admin/system", label: "System Status", icon: Activity }, // New Feature Link (God Mode)
    { href: "/admin/finance", label: "Finance AI", icon: Bitcoin },
    { href: "/admin/profile", label: "Profile Settings", icon: Settings },
  ];

  return (
    <div className={cn("sticky top-0 h-screen overflow-y-auto pb-12 w-64 border-r bg-card hidden md:block", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Admin Panel
          </h2>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Account
            </h2>
            <div className="space-y-1">
                 <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-100" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                 </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
