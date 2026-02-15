"use client";

import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BidDrawer } from "@/components/bids/BidDrawer";

type JobDetailClientProps = {
  job: any;
  viewerUserId: string;
};

function normalizeStatus(status: unknown) {
  return typeof status === "string" ? status.toLowerCase() : "";
}

function getJobStatusBadgeStyles(status: unknown) {
  switch (normalizeStatus(status)) {
    case "open":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
    case "in_progress":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
    case "completed":
      return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
  }
}

function getJobStatusLabel(status: unknown) {
  switch (normalizeStatus(status)) {
    case "open":
      return "招募中";
    case "in_progress":
      return "进行中";
    case "completed":
      return "已完成";
    case "closed":
      return "已关闭";
    default:
      return "未知状态";
  }
}

function getBidStatusBadgeStyles(status: unknown) {
  const s = typeof status === "string" ? status.toUpperCase() : "";
  switch (s) {
    case "PENDING":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "ACCEPTED":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "REJECTED":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function getBidStatusLabel(status: unknown) {
  const s = typeof status === "string" ? status.toUpperCase() : "";
  switch (s) {
    case "PENDING":
      return "审核中";
    case "ACCEPTED":
      return "已中标";
    case "REJECTED":
      return "未中标";
    default:
      return "未知状态";
  }
}

export function JobDetailClient({ job, viewerUserId }: JobDetailClientProps) {
  const isCreator = !!viewerUserId && !!job?.creator_id && viewerUserId === job.creator_id;
  const jobStatus = normalizeStatus(job?.status);
  const canBid = !isCreator && jobStatus === "open";

  const createdAtText = job?.created_at
    ? format(new Date(job.created_at), "yyyy-MM-dd")
    : "";

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className={cn("font-medium px-2 py-0", getJobStatusBadgeStyles(job?.status))}
            >
              {getJobStatusLabel(job?.status)}
            </Badge>
            <div className="text-sm text-slate-500">发布于 {createdAtText}</div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            {job?.title ?? "未命名任务"}
          </h1>

          <div className="text-slate-400">
            预算：
            <span className="ml-2 text-brand-action font-bold">
              ¥{typeof job?.budget === "number" ? job.budget.toLocaleString() : job?.budget ?? "-"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="secondary" className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-none">
            <Link href="/dashboard/jobs">返回列表</Link>
          </Button>

          {canBid ? (
            <BidDrawer
              jobId={job.id}
              trigger={
                <Button className="bg-brand-action hover:bg-amber-600 text-white font-bold">
                  我要接单
                </Button>
              }
            />
          ) : null}
        </div>
      </div>

      <Card className="bg-brand-surface border-brand-border">
        <CardHeader>
          <CardTitle className="text-slate-100">需求描述</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
            {job?.description?.trim() ? job.description : "暂无详细需求描述"}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-brand-surface border-brand-border">
        <CardHeader>
          <CardTitle className="text-slate-100">关于发布者</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/10">
            <AvatarImage src={job?.profiles?.avatar_url ?? undefined} />
            <AvatarFallback className="bg-slate-800 text-xs">
              {job?.profiles?.username?.slice?.(0, 1) ?? "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-slate-100">{job?.profiles?.username ?? "匿名发布者"}</div>
            <div className="text-xs text-slate-500">发布者 ID：{job?.creator_id ?? "-"}</div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-brand-surface border-brand-border">
        <CardHeader>
          <CardTitle className="text-slate-100">投标列表</CardTitle>
        </CardHeader>
        <CardContent>
          {Array.isArray(job?.bids) && job.bids.length > 0 ? (
            <div className="space-y-3">
              {job.bids.map((bid: any) => {
                const bidCreatedAt = bid?.createdAt ? format(new Date(bid.createdAt), "yyyy-MM-dd") : "";
                return (
                  <div
                    key={bid.id}
                    className="rounded-xl border border-brand-border bg-black/20 p-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-bold text-slate-100">
                          {bid?.bidder?.name || bid?.bidder?.username || "匿名投标者"}
                        </div>
                        <Badge variant="outline" className={cn("px-2 py-0", getBidStatusBadgeStyles(bid?.status))}>
                          {getBidStatusLabel(bid?.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-500">提交于 {bidCreatedAt}</div>
                    </div>

                    <div className="text-sm text-slate-300">
                      报价：
                      <span className="ml-2 font-extrabold text-brand-action">¥{bid?.amount ?? "-"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-slate-400">暂无投标记录</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
