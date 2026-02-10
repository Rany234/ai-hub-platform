import { Skeleton } from "@/components/ui/skeleton";

export function JobListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {/* header row placeholder */}
      <div className="flex items-center justify-between px-4 py-3">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-24" />
      </div>

      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-6 px-4 py-4 rounded-lg"
        >
          <div className="min-w-0 flex-1 space-y-3">
            <Skeleton className="h-5 w-3/5" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3.5 w-2/5" />
          </div>
          <div className="flex flex-col items-end gap-3">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
