import { Suspense } from "react";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { StatsSkeleton } from "@/components/dashboard/StatsSkeleton";
import { DashboardJobList } from "@/components/dashboard/DashboardJobList";
import { JobListSkeleton } from "@/components/dashboard/JobListSkeleton";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function FreelancerView() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">你好，开发者！来看看今天的新机会。</h1>
        <p className="text-sm text-muted-foreground">浏览任务广场，找到适合你的项目</p>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/dashboard/jobs">浏览任务广场</Link>
        </Button>
      </div>

      <Suspense fallback={<StatsSkeleton />}>
        <DashboardStats userId={user.id} />
      </Suspense>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">最新任务广场</h2>
          <Button asChild variant="outline">
            <Link href="/dashboard/jobs">查看全部</Link>
          </Button>
        </div>

        <Suspense fallback={<JobListSkeleton rows={5} />}>
          <DashboardJobList userId={user.id} role="freelancer" />
        </Suspense>
      </div>
    </div>
  );
}
