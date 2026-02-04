import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function JobCardSkeleton() {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-9 w-20" />
      </CardFooter>
    </Card>
  );
}