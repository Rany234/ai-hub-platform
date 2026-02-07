import Link from "next/link";
import { redirect } from "next/navigation";
import { Ghost, Globe } from "lucide-react";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { JobsClient } from "./JobsClient";

export default async function JobMarketplacePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/jobs");
  }

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, description, budget, deadline, status, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">任务广场</h1>
          <p className="text-muted-foreground mt-1">发现最新的 AI 需求，开启您的远程工作之旅</p>
        </div>
        <Link 
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          发布任务
        </Link>
      </div>

      {error ? <p className="text-sm text-red-600 mb-4">加载失败: {error.message}</p> : null}

      {!jobs || jobs.length === 0 ? (
        <EmptyState
          title="暂时没有开放的任务"
          description="大厅里空空如也，您可以稍后再来看看，或者发布一个您自己的需求。"
          icon={Globe}
          actionLabel="发布任务"
          href="/dashboard/jobs/new"
        />
      ) : (
        <div className="bg-card rounded-xl border shadow-sm p-1">
        <JobsClient jobs={(jobs as any) ?? []} />
        </div>
      )}
    </div>
  );
}
