import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BadgeCheck, CalendarClock, Coins } from "lucide-react";

import ClientDate from "@/components/jobs/ClientDate";
import { BidButtonWithDrawer } from "@/components/bids/BidButtonWithDrawer";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { BidList } from "@/components/bids/BidList";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { getBidsByJobId, getJobById } from "@/app/actions/job";

export const dynamic = "force-dynamic";

type JobWithProfile = Awaited<ReturnType<typeof getJobById>> & {
  profiles?:
    | {
        id: any;
        full_name: any;
        avatar_url: any;
        role: any;
      }
    | Array<{
        id: any;
        full_name: any;
        avatar_url: any;
        role: any;
      }>;
};

function getStatusBadgeVariant(status?: string | null) {
  if (status === "open") return "default";
  return "secondary";
}

function getStatusLabel(status?: string | null) {
  if (status === "open") return "Open";
  if (status === "closed") return "Closed";
  if (status === "in_progress") return "In progress";
  if (status === "completed") return "Completed";
  return status ?? "Unknown";
}

function getStatusClassName(status?: string | null) {
  if (status === "open") return "bg-emerald-600 text-white";
  if (status === "in_progress") return "bg-blue-600 text-white";
  if (status === "completed") return "bg-purple-600 text-white";
  if (status === "closed") return "bg-zinc-500 text-white";
  return "bg-muted text-foreground";
}

export default async function JobDetailPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams?.id;

  if (!id || id === "undefined") {
    return notFound();
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const job = (await getJobById(id)) as JobWithProfile | null;

  if (!job) {
    return notFound();
  }

  const isOwner = Boolean(user?.id && job?.creator_id && user.id === job.creator_id);

  const bids = await getBidsByJobId(id);

  const selectedBidId = (job as any)?.selected_bid_id as string | null | undefined;
  const winnerBid = selectedBidId ? bids?.find((b: any) => b?.id === selectedBidId) : undefined;
  const acceptedBid = bids?.find((b: any) => b?.status === "accepted");
  const winnerBidderId = (winnerBid as any)?.bidder_id ?? (acceptedBid as any)?.bidder_id;
  const isWinner = Boolean(user?.id && winnerBidderId && user.id === winnerBidderId);

  const { data: currentProfile } = user?.id
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  const userRole = currentProfile?.role ?? null;

  // 兼容 profiles 数组/对象/undefined 等结构
  const profileRaw = job?.profiles;
  const profile = Array.isArray(profileRaw) ? profileRaw?.[0] : profileRaw;

  const budget = job?.budget ? Number(job?.budget) : 0;
  const description = job?.description;

  // 极度安全的时间处理：防止下游 date-fns/format 崩溃
  const rawDate = job?.created_at;
  const safeDate =
    rawDate && !Number.isNaN(new Date(rawDate).getTime())
      ? new Date(rawDate)
      : new Date();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" className="px-0" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回列表
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground truncate">Job ID: {job?.id}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight break-words">
              {job?.title ?? "未命名任务"}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={getStatusBadgeVariant(job?.status)}
                className={`rounded-full px-3 py-1 ${getStatusClassName(job?.status)}`}
              >
                <BadgeCheck className="mr-1 h-4 w-4" />
                {getStatusLabel(job?.status)}
              </Badge>
              {job?.budget !== null && job?.budget !== undefined ? (
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  <Coins className="mr-1 h-4 w-4" />
                  预算已设置
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="bg-white/50 p-8 rounded-3xl border border-slate-100">
            <div className="prose prose-blue prose-lg max-w-none prose-headings:mt-8 prose-p:leading-relaxed dark:prose-invert">
              {typeof description === "string" ? (
                <ReactMarkdown>{description.trim() ? description : "暂无描述"}</ReactMarkdown>
              ) : null}
            </div>
          </div>

          <div className="border-t border-slate-100" />

          <div>
            <div className="mb-4 text-lg font-semibold text-slate-900">
              收到的投标 ({bids?.length ?? 0})
            </div>
            <BidList
              bids={(bids as any) ?? []}
              isEmployer={isOwner}
              jobStatus={job?.status}
              selectedBidId={(job as any)?.selected_bid_id}
            />
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 text-white">
                <div className="text-sm/6 opacity-90">预算</div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight font-mono">
                  ${budget ? budget : "-"}
                </div>
                <div className="mt-4 inline-flex items-center gap-2 text-sm/6 opacity-90">
                  <CalendarClock className="h-4 w-4" />
                  <span>
                    <ClientDate date={safeDate} formatStr="yyyy-MM-dd HH:mm" />
                  </span>
                </div>
              </div>
            </div>

            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  雇主信息
                  <BadgeCheck className="h-4 w-4 text-blue-600" />
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url ?? ""} />
                  <AvatarFallback>{profile?.full_name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="font-medium truncate">{profile?.full_name ?? "匿名用户"}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {profile?.role === "client" ? "雇主" : profile?.role === "freelancer" ? "开发者" : profile?.role ?? "-"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <BidButtonWithDrawer
              jobId={id}
              jobStatus={job?.status}
              isOwner={isOwner}
              isWinner={isWinner}
              userRole={userRole}
              deliveryUrl={(job as any)?.delivery_url}
              deliveryNote={(job as any)?.delivery_note}
              rejectionReason={(job as any)?.rejection_reason}
            />
          </div>
        </div>
      </div>
    </div>
  );
}