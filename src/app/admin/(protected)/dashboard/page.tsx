"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, Users, RefreshCw, MessageSquare, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useState } from "react";

interface DashboardStats {
  views: number;
  messages: number;
  ragDocs: number;
  projects: number;
  systemStatus: string;
  recentActivity: any[];
}

import { RecentActivity } from "@/app/admin/components/recent-activity";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const s = stats || { views: 0, messages: 0, ragDocs: 0, projects: 0 };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
             Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16 mb-1" />
                        <Skeleton className="h-3 w-32" />
                    </CardContent>
                </Card>
             ))
        ) : (
            <>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.views || 0}</div>
                    <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Messages</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.messages || 0}</div>
                    <p className="text-xs text-muted-foreground">+180.1% from last month</p>
                </CardContent>
                </Card>
                <Card>
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">RAG Documents</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.ragDocs || 0}</div>
                    <p className="text-xs text-muted-foreground">Indexed in Vector DB</p>
                </CardContent>
                </Card>
                <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats?.projects || 0}</div>
                    <p className="text-xs text-muted-foreground">Live on portfolio</p>
                </CardContent>
                </Card>
            </>
        )}
      </div>

      {/* Editor / Actions Placeholder & Recent Activity */}
      {/* Recent Activity & Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <RecentActivity activity={stats?.recentActivity || []} />
        
        <div className="col-span-4 lg:col-span-4 flex flex-col gap-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                 <Link href="/admin/projects/new">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                             <CardTitle className="text-sm font-medium">New Project</CardTitle>
                             <Activity className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                             <p className="text-xs text-muted-foreground">Add case study</p>
                        </CardContent>
                    </Card>
                 </Link>
                 <Link href="/admin/blog/new">
                    <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-dashed">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                             <CardTitle className="text-sm font-medium">Write Post</CardTitle>
                             <FileText className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                         <CardContent>
                             <p className="text-xs text-muted-foreground">Publish to blog</p>
                        </CardContent>
                    </Card>
                 </Link>
            </div>

             {/* Simple Chart Placeholder (Simulated for visual polish) */}
             <Card className="flex-1">
                <CardHeader>
                    <CardTitle className="text-sm">Traffic Overview (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[200px] flex items-end gap-2">
                        {[45, 60, 30, 90, 42, 85, 95].map((val, i) => (
                             <div key={i} className="flex-1 bg-primary/20 hover:bg-primary/40 transition-colors rounded-t-md relative group">
                                <div className="absolute inset-x-0 bottom-0 bg-primary rounded-t-md" style={{ height: `${val}%`}} />
                                <div className="absolute top-0 w-full text-center text-[10px] opacity-0 group-hover:opacity-100 -mt-5 transition-opacity">
                                    {val * 12}
                                </div>
                             </div>
                        ))}
                    </div>
                     <div className="flex justify-between mt-2 text-xs text-muted-foreground px-2">
                         <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                     </div>
                </CardContent>
             </Card>
        </div>
      </div>
    </div>
  );
}
