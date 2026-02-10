import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Technical Writings</h1>
        <p className="text-xl text-muted-foreground">Thoughts on engineering, architecture, and the future of work.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-1">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-6 w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
