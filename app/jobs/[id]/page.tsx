import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { SubmitProposalClient } from "./SubmitProposalClient";
import { ProposalsListClient } from "./ProposalsListClient";

function assertString(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) throw new Error("无效的任务 ID");
  return v;
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobId = assertString(id);

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      "id, title, description, budget, deadline, status, created_at, creator_id, profiles(id, username, full_name, avatar_url)"
    )
    .eq("id", jobId)
    .maybeSingle();

  if (jobError || !job) {
    notFound();
  }

  const creator = job.profiles as any;

  const isCreator = user?.id === job.creator_id;

  const { data: myProposal } = user
    ? await supabase
        .from("proposals")
        .select("id, status")
        .eq("job_id", job.id)
        .eq("freelancer_id", user.id)
        .maybeSingle()
    : { data: null };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <div>
              发布者：{creator?.full_name || creator?.username || creator?.id || "未知"}
            </div>
            <div>发布于 {new Date(job.created_at).toLocaleDateString("zh-CN")}</div>
          </div>
        </div>
        <div className="text-xl font-semibold text-green-600">¥{job.budget}</div>
      </div>

      {job.description ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">需求描述</h2>
          <p className="mt-2 whitespace-pre-wrap">{job.description}</p>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">预算</div>
          <div className="mt-1 font-mono">¥{job.budget}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">期望交付日期</div>
          <div className="mt-1 font-mono">
            {job.deadline ? new Date(job.deadline).toLocaleDateString("zh-CN") : "未填写"}
          </div>
        </div>
      </div>

      <div className="mt-8 border rounded-lg p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">
            {isCreator ? "收到的投标" : "投标"}
          </div>
          {!isCreator && user && !myProposal && job.status === "open" && (
            <SubmitProposalClient jobId={job.id} />
          )}
          {!isCreator && user && myProposal && (
            <div className="text-xs text-muted-foreground">
              {myProposal.status === "pending" ? "已投标，等待买家选择" : `投标状态：${myProposal.status}`}
            </div>
          )}
        </div>

        {isCreator && <ProposalsListClient jobId={job.id} />}
      </div>
    </div>
  );
}