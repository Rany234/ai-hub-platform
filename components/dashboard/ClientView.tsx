import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { JobCard } from "@/components/jobs/JobCard";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type ClientViewProps = {
  userId: string;
};

export async function ClientView({ userId }: ClientViewProps) {
  const supabase = await createSupabaseServerClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, creator_id, title, description, budget, status, created_at")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
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

        <div className="rounded-lg border p-4 text-sm text-red-600">加载任务失败，请稍后重试。</div>
      </div>
    );
  }

  const hasJobs = Array.isArray(jobs) && jobs.length > 0;

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

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">我发布的任务</h2>
        {hasJobs ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} isOwner />
            ))}
          </div>
        ) : (
          <EmptyState
            title="还没有发布任务"
            description="发布你的第一个任务，让开发者来帮你完成项目。"
            actionLabel="发布第一个任务"
            href="/dashboard/jobs/new"
          />
        )}
      </div>
    </div>
  );
}