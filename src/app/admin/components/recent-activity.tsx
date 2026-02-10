"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Activity, FileText, MessageSquare, FolderPlus } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "project" | "blog" | "message";
  title: string;
  date: string;
}

interface RecentActivityProps {
  activity: ActivityItem[];
}

export function RecentActivity({ activity }: RecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "project": return <FolderPlus className="h-4 w-4 text-blue-500" />;
      case "blog": return <FileText className="h-4 w-4 text-orange-500" />;
      case "message": return <MessageSquare className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" /> Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activity.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">No recent activity.</div>
          ) : (
            activity.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-muted/50 p-2">
                    {getIcon(item.type)}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium leading-none">{item.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {item.type} • {format(new Date(item.date), "MMM d, h:mm a")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
