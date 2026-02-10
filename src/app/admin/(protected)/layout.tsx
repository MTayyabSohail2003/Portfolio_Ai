import type { Metadata } from "next";
import { AdminSidebar } from "../components/admin-sidebar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Portal | Muhammad Tayyab Sohail",
  description: "Protected Admin Access Only",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Strict RBAC: Must be admin or super-admin
  if (!session || (session.user.role !== "admin" && session.user.role !== "super-admin")) {
    redirect("/admin"); // Redirect to login page if inside admin/dashboard
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 p-8 pt-6">
          {children}
        </div>
      </div>
    </div>
  );
}
