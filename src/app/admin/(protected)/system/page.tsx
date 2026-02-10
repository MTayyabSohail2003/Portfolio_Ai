
import { SystemMonitor } from "@/components/features/system-monitor";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "System Status | God Mode",
};

export default function SystemPage() {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-bold tracking-tight">System Monitor (God Mode)</h2>
                    <p className="text-muted-foreground">Real-time infrastructure telemetry and diagnostics.</p>
                </div>
            </div>
            
            <SystemMonitor />
        </div>
    )
}
