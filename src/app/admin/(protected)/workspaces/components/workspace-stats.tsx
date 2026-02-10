"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Layout, Users, Activity, Clock } from "lucide-react";

interface WorkspaceStatsProps {
    workspace: any;
}

export function WorkspaceStats({ workspace }: WorkspaceStatsProps) {
    // Calculate dynamic stats
    const totalBoards = workspace.boards?.length || 0;
    const totalMembers = workspace.members?.length || 0;
    // Mock activity for now if backend doesn't support it yet
    const recentActivity = 0;

    const stats = [
        {
            label: "Total Boards",
            value: totalBoards,
            icon: Layout,
            trend: "+2 this week", // Mock data
            trendUp: true,
        },
        {
            label: "Active Members",
            value: totalMembers,
            icon: Users,
            trend: "Stable",
            trendUp: null, // Neutral
        },
        {
            label: "Open Tasks",
            value: "12", // Mock data until we have granular board data
            icon: Activity,
            trend: "-5 remaining",
            trendUp: true, // "Good" that tasks are down? Or up? Context dependent.
        },
        {
            label: "Avg. Turnaround",
            value: "2.4d", // Mock data
            icon: Clock,
            trend: "-4h vs last week",
            trendUp: true, // Faster is better
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.label}>
                    <CardContent className="p-6 flex items-center justify-between space-x-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold">{stat.value}</span>
                                {stat.trend && (
                                    <span className={`text-xs ${stat.trendUp === true ? "text-green-500" :
                                            stat.trendUp === false ? "text-red-500" : "text-muted-foreground"
                                        }`}>
                                        {stat.trend}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-full text-primary">
                            <stat.icon className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
