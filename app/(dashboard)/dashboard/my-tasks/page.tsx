import Link from "next/link";
import { redirect } from "next/navigation";
import { Ghost, ExternalLink } from "lucide-react";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MyTasksPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/my-tasks");
  }

  const { data: bids, error } = await supabase
    .from("bids")
    .select(
      "id,amount,delivery_time,proposal,created_at,status,jobs!inner(id,title,status,created_at,delivery_url,delivery_note)"
    )
    .eq("bidder_id", user.id)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) {
    return <p className="mt-4 text-sm text-red-600">{error.message}</p>;
  }

  const items = (bids as any) ?? [];

  const getStatusBadgeVariant = (status?: string | null) => {
    if (status === "in_progress") return "default";
    if (status === "completed") return "secondary";
    return "outline";
  };

  const getStatusLabel = (status?: string | null) => {
    if (status === "in_progress") return "开发中";
    if (status === "completed") return "已结项";
    return status ?? "未知";
  };

  const getStatusColor = (status?: string | null) => {
    if (status === "in_progress") return "bg-blue-600 text-white";
    if (status === "completed") return "bg-purple-600 text-white";
    return "bg-muted text-foreground";
  };

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-baseline justify-between gap-4 mb-8">
        <h1 className="text-2xl font-semibold">我的任务</h1>
      </div>

      {!items || items.length === 0 ? (
        <EmptyState
          title="暂无任务"
          description="你还没有被采纳的任务，快去投标吧！"
          icon={Ghost}
          actionLabel="去投标"
          href="/dashboard/jobs"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item: any) => {
            const job = item.jobs;
            const amountNum = Number(item.amount) || 0;

            return (
              <Card key={item.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg font-semibold line-clamp-2">
                      <Link href={`/dashboard/jobs/${job.id}`} className="hover:text-blue-600 transition-colors">
                        {job.title}
                      </Link>
                    </CardTitle>
                    <Badge variant={getStatusBadgeVariant(job.status)} className={`rounded-full px-3 py-1 ${getStatusColor(job.status)}`}>
                      {getStatusLabel(job.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">中标金额</span>
                    <span className="font-mono text-base text-blue-600">￥{amountNum}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">交付周期</span>
                    <span>{item.delivery_time ?? "-"}</span>
                  </div>

                  {job.delivery_url ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">交付链接：</span>
                      <a
                        href={job.delivery_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        查看 <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  ) : null}

                  {job.delivery_note ? (
                    <div className="text-sm">
                      <div className="text-muted-foreground mb-1">交付说明：</div>
                      <div className="text-slate-700 whitespace-pre-wrap break-words bg-slate-50 rounded p-2 text-xs">
                        {job.delivery_note}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}