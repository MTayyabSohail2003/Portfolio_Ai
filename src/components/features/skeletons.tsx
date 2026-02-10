import { Skeleton } from "@/components/ui/skeleton";

export function ExperienceSkeleton() {
  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-4 border p-6 rounded-xl">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" /> {/* Position */}
              <Skeleton className="h-4 w-32" /> {/* Company */}
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24" /> {/* Date */}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex gap-2 flex-wrap pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                </div>
            </div>
        ))}
    </div>
  );
}

export function SkillsSkeleton() {
    return (
        <div className="flex flex-col gap-8 w-full">
            <div className="space-y-4">
                <div className="flex gap-4">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
