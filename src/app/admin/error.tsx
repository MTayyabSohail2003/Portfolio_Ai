"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin Error:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center gap-6 text-center p-4 border-2 border-dashed rounded-xl bg-muted/10">
      <div className="rounded-full bg-orange-100 p-4 dark:bg-orange-900/20">
        <AlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard Error</h2>
        <p className="text-muted-foreground w-full max-w-md mx-auto">
          We couldn't load this dashboard section. It might be a network issue or missing data.
        </p>
         <p className="font-mono text-xs text-red-500 bg-red-50 dark:bg-red-900/10 p-2 rounded max-w-lg mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
            {error.message}
         </p>
      </div>
      <Button onClick={() => reset()}>
        Attempt to Recover
      </Button>
    </div>
  );
}
