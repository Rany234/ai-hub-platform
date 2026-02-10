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
    <div className="p-6 space-y-8">
      {/* 紧凑型 Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-dark to-brand-primary p-8 shadow-lg">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
            <p className="text-blue-100/80 text-sm">管理你发布的任务，并找到合适的开发者</p>
          </div>

          <Button
            asChild
            variant="outline"
            className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-sm px-8"
          >
            <Link href="/dashboard/jobs">View Marketplace</Link>
          </Button>
        </div>
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
