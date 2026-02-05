"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ArrowLeft, BadgeCheck, CalendarClock, Coins, Hammer } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getJobById } from "@/app/actions/job";

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

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<JobWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        const data = (await getJobById(params.id)) as JobWithProfile;
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      } finally {
        setLoading(false);
      }
    }

    loadJob();
  }, [params.id]);

  const profile = useMemo(() => {
    if (!job?.profiles) return null;
    return Array.isArray(job.profiles) ? job.profiles[0] ?? null : job.profiles;
  }, [job]);

  const createdAt = job?.created_at ? new Date(job.created_at) : null;
  const createdAtText = createdAt ? format(createdAt, "yyyy-MM-dd HH:mm") : "";

  const handleBid = () => {
    toast.info("投标功能正在全力开发中，敬请期待！");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-6 w-56" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-56 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6">
        <div className="mx-auto max-w-xl text-center space-y-4">
          <h1 className="text-2xl font-semibold">任务不存在</h1>
          <p className="text-muted-foreground">{error ?? "未找到该任务"}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => router.back()} className="px-0">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div className="text-sm text-muted-foreground truncate">Job ID: {job.id}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold tracking-tight break-words">{job.title ?? "未命名任务"}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge
                      variant={getStatusBadgeVariant(job.status)}
                      className={`rounded-full px-3 py-1 ${getStatusClassName(job.status)}`}
                    >
                      <BadgeCheck className="mr-1 h-4 w-4" />
                      {getStatusLabel(job.status)}
                    </Badge>
                    {job.budget !== null && job.budget !== undefined ? (
                      <Badge variant="secondary" className="rounded-full px-3 py-1">
                        <Coins className="mr-1 h-4 w-4" />
                        预算已设置
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="prose prose-zinc max-w-none dark:prose-invert">
                <ReactMarkdown>
                  {job.description?.trim() ? job.description : "暂无描述"}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-700 to-indigo-800 p-6 text-white">
                <div className="text-sm/6 opacity-90">预算</div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight">
                  ${job.budget ?? "-"}
                </div>
                {createdAtText ? (
                  <div className="mt-4 inline-flex items-center gap-2 text-sm/6 opacity-90">
                    <CalendarClock className="h-4 w-4" />
                    <span>{createdAtText}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <Card className="rounded-2xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-base">雇主信息</CardTitle>
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

            <Button
              onClick={handleBid}
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-800 text-white shadow-xl transition-transform hover:scale-105"
            >
              <Hammer className="mr-2 h-5 w-5" />
              立即投标
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
