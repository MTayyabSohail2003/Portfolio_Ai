"use client";

import { Button } from "@/components/ui/button";
import { Skull } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to an error reporting service if available
    console.error("Global Error Caught:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-6 text-center p-4">
          <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
            <Skull className="h-16 w-16 text-red-600 dark:text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">System Critical Failure</h1>
            <p className="text-lg text-muted-foreground max-w-[500px]">
              Something went wrong. The application encountered a fatal error.
            </p>
            {process.env.NODE_ENV === "development" && (
                <div className="p-4 bg-muted rounded text-left overflow-auto max-w-2xl max-h-64 font-mono text-sm border-l-4 border-red-500">
                    <p className="font-bold text-red-500">Error: {error.message}</p>
                    <pre className="text-xs mt-2 opacity-70">{error.stack}</pre>
                </div>
            )}
          </div>
          <div className="flex gap-4">
            <Button onClick={() => reset()} variant="default">
              Try Again
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline">
               Hard Refresh
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
