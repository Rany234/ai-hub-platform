import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type JobListSkeletonProps = {
  rows?: number;
};

export function JobListSkeleton({ rows = 5 }: JobListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Card key={i} className="border-white/10 bg-white/50">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <Skeleton className="h-6 w-20 ml-auto" />
                <Skeleton className="h-3 w-12 ml-auto" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t border-slate-50 pt-4 bg-slate-50/30">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
