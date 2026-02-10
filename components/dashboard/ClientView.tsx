import { Suspense } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ClientStats } from "@/components/dashboard/ClientStats";
import { StatsSkeleton } from "@/components/dashboard/StatsSkeleton";
import { DashboardJobList } from "@/components/dashboard/DashboardJobList";
import { JobListSkeleton } from "@/components/dashboard/JobListSkeleton";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type ClientViewProps = {
  userId: string;
};

export async function ClientView({ userId }: ClientViewProps) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">你好，雇主！准备好发布任务了吗？</h1>
        <p className="text-sm text-muted-foreground">管理你发布的任务，并找到合适的开发者</p>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/jobs/new">发布新任务</Link>
        </Button>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <ClientStats userId={userId} />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">我发布的任务</h2>
        <Suspense fallback={<JobListSkeleton rows={3} />}>
          <DashboardJobList userId={userId} role="client" />
        </Suspense>
      </div>
    </div>
  );
}
