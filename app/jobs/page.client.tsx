"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type JobRow = {
  id: string;
  title: string;
  description: string | null;
  budget: string | number;
  deadline: string | null;
  status: string;
  created_at: string;
  creator_id: string;
  creator?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function JobsPageClient({ min, max }: { min?: string; max?: string }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [jobs, setJobs] = useState<JobRow[] | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      let query = supabase
        .from("jobs")
        .select(
          "id, title, description, budget, deadline, status, created_at, creator_id, creator:profiles(id, username, full_name, avatar_url)"
        )
        .eq("status", "open")
        .order("created_at", { ascending: false });

      const minN = min ? Number(min) : null;
      const maxN = max ? Number(max) : null;
      if (minN !== null && !Number.isNaN(minN)) query = query.gte("budget", minN);
      if (maxN !== null && !Number.isNaN(maxN)) query = query.lte("budget", maxN);

      const { data, error } = await query;
      console.log("Jobs Data:", data, "Error:", error);

      if (!mounted) return;
      setJobs(((data ?? []) as any) as JobRow[]);
    })();

    return () => {
      mounted = false;
    };
  }, [max, min, supabase]);

  if (jobs === null) {
    return <div className="border rounded-lg p-8 text-sm text-muted-foreground">加载中...</div>;
  }

  if (jobs.length === 0) {
    return <div className="border rounded-lg p-8 text-sm text-muted-foreground">暂无任务</div>;
  }

  return (
    <section className="grid gap-4">
      {jobs.map((job) => {
        const creator = job.creator ?? null;
        return (
          <div key={job.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold">{job.title}</div>
                {job.description ? (
                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </div>
                ) : null}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">¥{job.budget}</div>
                <div className="mt-1 text-xs text-muted-foreground">预算</div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full border overflow-hidden bg-white flex items-center justify-center text-xs text-muted-foreground">
                  {creator?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="avatar"
                      src={creator.avatar_url}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "无"
                  )}
                </div>
                <div className="text-sm">
                  {creator?.full_name || creator?.username || creator?.id || "匿名"}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                发布于 {new Date(job.created_at).toLocaleDateString("zh-CN")}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}
