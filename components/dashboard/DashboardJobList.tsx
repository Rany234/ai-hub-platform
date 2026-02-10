import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/ui/empty-state";

type DashboardJobListProps = {
  userId: string;
  role: "client" | "freelancer";
};

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
    return (
      <EmptyState
        title="暂无任务"
        description={role === "client" ? "你还没有发布过任何任务。" : "目前还没有适合的任务，请稍后再来。"}
        actionLabel={role === "client" ? "发布第一个任务" : "浏览全部任务"}
        href={role === "client" ? "/dashboard/jobs/new" : "/dashboard/jobs"}
      />
    );
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
