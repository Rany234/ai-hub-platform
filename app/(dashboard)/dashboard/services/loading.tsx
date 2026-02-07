import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-64 bg-muted animate-pulse rounded" />

        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-40 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded mt-3" />
          </div>
          <div className="h-10 w-28 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border shadow-sm overflow-hidden flex flex-col"
          >
            <div className="bg-slate-50/50 p-6 pb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
