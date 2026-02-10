import { Skeleton } from "@/components/ui/skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
           <Skeleton className="h-10 w-[200px]" />
           <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
             <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>

      <div className="pt-4">
         <Skeleton className="h-8 w-[150px] mb-4" />
         <TableSkeleton rowCount={5} columnCount={4} />
      </div>
    </div>
  );
}
