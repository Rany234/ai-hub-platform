"use client";

import Link from "next/link";

import { JobCard } from "@/components/jobs/JobCard";
import { Button } from "@/components/ui/button";

export function JobsClient({ jobs, userId }: { jobs: any[]; userId: string }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">任务许愿池 (Bounty Hall)</h1>
          <p className="text-sm text-muted-foreground">发布需求，通过“半开源”模式低成本获取资产。</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/jobs/new">发布悬赏</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {jobs.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            暂无公开任务，快来发布你的第一个悬赏吧。
          </div>
        ) : (
          jobs.map((job) => {
            const isOwner = Boolean(userId && job?.creator_id && userId === job.creator_id);
            return <JobCard key={job.id} job={job} userId={userId} isOwner={isOwner} />;
          })
        )}
      </div>
    </div>
  );
}
