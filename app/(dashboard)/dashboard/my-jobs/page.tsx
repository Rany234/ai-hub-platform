import { redirect } from "next/navigation";
import { Ghost, Briefcase, Plus } from "lucide-react";
import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobsClient } from "../jobs/JobsClient";

export default async function MyJobsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/my-jobs");
  }

  // Fetch jobs where user is the employer (creator)
  const { data: createdJobs, error: createdError } = await supabase
    .from("jobs")
    .select("id, title, description, budget, deadline, status, created_at")
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch jobs where user is the worker (hired)
  const { data: workingJobs, error: workingError } = await supabase
    .from("jobs")
    .select("id, title, description, budget, deadline, status, created_at")
    .eq("worker_id", user.id)
    .in("status", ["in_progress", "completed"])
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的工作台</h1>
          <p className="text-muted-foreground mt-1">管理您发布的需求和承接的任务</p>
        </div>
        <Link 
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm"
        >
          <Plus className="size-4" />
          发布新任务
        </Link>
      </div>

      <Tabs defaultValue="employer" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
          <TabsTrigger value="employer" className="flex items-center gap-2">
            <Plus className="size-4" />
            我发布的
          </TabsTrigger>
          <TabsTrigger value="worker" className="flex items-center gap-2">
            <Briefcase className="size-4" />
            我承接的
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employer" className="space-y-6">
          {createdError ? <p className="text-sm text-red-600">加载失败: {createdError.message}</p> : null}
          {!createdJobs || createdJobs.length === 0 ? (
            <EmptyState
              title="暂无发布的任务"
              description="您还没有发布任何 AI 需求"
              icon={Ghost}
              actionLabel="去发布"
              href="/dashboard/jobs/new"
            />
          ) : (
            <div className="bg-card rounded-xl border shadow-sm p-1">
              <JobsClient jobs={(createdJobs as any) ?? []} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="worker" className="space-y-6">
          {workingError ? <p className="text-sm text-red-600">加载失败: {workingError.message}</p> : null}
          {!workingJobs || workingJobs.length === 0 ? (
            <EmptyState
              title="暂无承接的任务"
              description="快去任务广场寻找合适的工作吧"
              icon={Briefcase}
              actionLabel="前往任务广场"
              href="/dashboard/jobs"
            />
          ) : (
            <div className="bg-card rounded-xl border shadow-sm p-1">
              <JobsClient jobs={(workingJobs as any) ?? []} />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
