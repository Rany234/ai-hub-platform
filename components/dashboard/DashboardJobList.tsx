import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { JobCard } from "@/components/jobs/JobCard";

type DashboardJobListProps = {
  userId: string;
  role: "client" | "freelancer";
};

function EmptyJobList({ role }: { role: DashboardJobListProps["role"] }) {
  const isClient = role === "client";
  const ctaHref = isClient ? "/dashboard/jobs/new" : "/dashboard/jobs";
  const ctaLabel = isClient ? "发布第一个任务" : "浏览全部任务";

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md">
      {/* busy grid */}
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(99,102,241,0.25),transparent_55%)]" />

      <div className="relative p-6">
        {/* Table frame */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30">
          <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-4 py-3 text-xs font-medium uppercase tracking-wider text-white/50">
            <div className="col-span-5">Project</div>
            <div className="col-span-3 text-right">Budget</div>
            <div className="col-span-2">Deadline</div>
            <div className="col-span-2">Status</div>
          </div>

          <div className="divide-y divide-white/10">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3">
                <div className="col-span-5">
                  <div className="h-4 w-3/4 rounded bg-gray-800/50 animate-pulse" />
                </div>
                <div className="col-span-3 flex justify-end">
                  <div className="h-4 w-24 rounded bg-gray-800/50 animate-pulse" />
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-16 rounded bg-gray-800/50 animate-pulse" />
                </div>
                <div className="col-span-2">
                  <div className="h-4 w-20 rounded-full bg-gray-800/50 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-6">
          <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md px-6 py-5 shadow-[0_0_80px_rgba(99,102,241,0.25)]">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">Marketplace is waiting for you</div>
              <div className="mt-1 text-sm text-white/60">
                {isClient ? "你来得很早，发布一个项目，让人才开始涌入。" : "你来得很早，先收藏几个机会，稍后回来会更热闹。"}
              </div>
              <div className="mt-5 flex justify-center">
                <Link
                  href={ctaHref}
                  className="inline-flex items-center justify-center rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110 active:scale-95"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function DashboardJobList({ userId, role }: DashboardJobListProps) {
  const supabase = await createSupabaseServerClient();

  // 1. 查询任务数据（包含发布者信息）
  let query = supabase
    .from("jobs")
    .select(`
      id, 
      creator_id, 
      title, 
      description, 
      budget, 
      status, 
      created_at, 
      profiles:profiles!jobs_creator_id_fkey(username, avatar_url)
    `);

  if (role === "client") {
    query = query.eq("creator_id", userId);
  }

  const { data: jobs, error: jobsError } = await query
    .order("created_at", { ascending: false })
    .limit(10);

  if (jobsError) {
    return (
      <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600">
        加载任务列表失败: {jobsError.message}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return <EmptyJobList role={role} />;
  }

  // 2. 聚合投标热度 (proposals 计数)
  const jobIds = jobs.map((j) => j.id);
  const { data: proposalsData } = await supabase
    .from("proposals")
    .select("job_id")
    .in("job_id", jobIds);

  const bidCounts = (proposalsData || []).reduce((acc: Record<string, number>, curr) => {
    acc[curr.job_id] = (acc[curr.job_id] || 0) + 1;
    return acc;
  }, {});

  // 3. 注入数据
  const enrichedJobs = jobs.map((job) => ({
    ...job,
    bid_count: bidCounts[job.id] || 0,
  }));

  return (
    <div className="space-y-4">
      {enrichedJobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isOwner={job.creator_id === userId}
          userId={userId}
        />
      ))}
    </div>
  );
}
