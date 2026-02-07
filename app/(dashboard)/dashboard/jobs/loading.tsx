import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";

export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-9 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-80 bg-muted animate-pulse rounded mt-3" />
        </div>
        <div className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-1">
        <div className="mt-6 space-y-4 p-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
