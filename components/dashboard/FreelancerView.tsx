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
    <div className="p-6 space-y-8">
      {/* 紧凑型 Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark to-brand-primary p-8 shadow-lg">
        {/* 背景装饰纹理 */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Welcome back, 开发者！
            </h1>
            <p className="text-blue-100/80 text-sm">
              今天有新的机会在等待着你，去任务广场看看吧。
            </p>
          </div>
          
          <Button asChild variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm px-8">
            <Link href="/dashboard/jobs">View Marketplace</Link>
          </Button>
        </div>
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
