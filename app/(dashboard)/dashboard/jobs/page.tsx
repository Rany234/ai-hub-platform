import Link from "next/link";
import { redirect } from "next/navigation";
import { Ghost } from "lucide-react";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { JobsClient } from "./JobsClient";

export default async function MyJobsPage() {
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
    .eq("creator_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">📢 我发布的任务</h1>
        <Link className="rounded-md bg-black text-white px-4 py-2 text-sm" href="/jobs/create">
          去发布
        </Link>
      </div>

      {error ? <p className="mt-4 text-sm text-red-600">{error.message}</p> : null}

      {!jobs || jobs.length === 0 ? (
        <EmptyState
          title="暂时没有任务"
          description="目前还没有发布任何 AI 需求，快去发布第一个任务吧！"
          icon={Ghost}
          actionLabel="发布任务"
          href="/jobs/create"
        />
      ) : (
        <JobsClient jobs={(jobs as any) ?? []} />
      )}
    </div>
  );
}
