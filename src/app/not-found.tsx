import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Ghost } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <Ghost className="h-16 w-16 text-muted-foreground animate-pulse" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground max-w-[500px]">
          The page you are looking for disappeared into the void (or never existed).
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
