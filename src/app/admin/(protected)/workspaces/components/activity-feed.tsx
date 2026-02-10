"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
    id: string;
    user: {
        name: string;
        image?: string;
    };
    action: string;
    target: string;
    timestamp: string;
}

export function ActivityFeed() {
    // Mock data for now
    const activities: ActivityItem[] = [
        {
            id: "1",
            user: { name: "Rana Tayyab", image: undefined },
            action: "created board",
            target: "Marketing Q1",
            timestamp: new Date().toISOString(), // Still client-side but acceptable for now
        },
        {
            id: "2",
            user: { name: "Rana Tayyab", image: undefined },
            action: "added member",
            target: "Sarah Connor",
            timestamp: "2023-10-26T10:00:00Z",
        },
        {
            id: "3",
            user: { name: "System", image: undefined }, // System user
            action: "synced",
            target: "GitHub Repo",
            timestamp: "2023-10-25T10:00:00Z",
        }
    ];

    return (
        <div className="space-y-8">
            {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-4">
                    <div className="relative mt-1">
                        <Avatar className="h-8 w-8 z-10 relative border-2 border-background">
                            <AvatarImage src={activity.user.image} />
                            <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                        </Avatar>
                        {index !== activities.length - 1 && (
                            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-12 bg-border -z-0" />
                        )}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm">
                            <span className="font-semibold">{activity.user.name}</span>{" "}
                            <span className="text-muted-foreground">{activity.action}</span>{" "}
                            <span className="font-medium text-foreground">{activity.target}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
            {activities.length === 0 && (
                <p className="text-muted-foreground text-sm">No recent activity.</p>
            )}
        </div>
    );
}
