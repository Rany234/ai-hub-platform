import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ClientStats } from "@/components/dashboard/ClientStats";
import { StatsSkeleton } from "@/components/dashboard/StatsSkeleton";
import { DashboardJobList } from "@/components/dashboard/DashboardJobList";
import { JobListSkeleton } from "@/components/dashboard/JobListSkeleton";

type ClientViewProps = {
  userId: string;
};

export async function ClientView({ userId }: ClientViewProps) {
  const session = await auth();
  const user = session?.user;

  if (!user) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">你好，雇主！准备好发布任务了吗？</h1>
        <p className="text-sm text-slate-400">管理你发布的任务，并找到合适的开发者</p>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" className="bg-white text-black hover:bg-slate-200 font-bold border-none shadow-xl">
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
