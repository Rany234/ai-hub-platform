"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ChevronRight, Edit, UserX } from "lucide-react";

import { getJobById } from "@/app/actions/job";

type JobWithProfile = Awaited<ReturnType<typeof getJobById>>;

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

function getStatusColor(status?: string | null) {
  switch (status) {
    case "open":
      return "bg-green-600 text-white";
    case "closed":
      return "bg-gray-500 text-white";
    case "in_progress":
      return "bg-blue-600 text-white";
    case "completed":
      return "bg-purple-600 text-white";
    default:
      return "";
  }
}

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [job, setJob] = useState<JobWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true);
        const data = await getJobById(params.id);
        setJob(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load job");
      } finally {
        setLoading(false);
      }
    }

    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUserId(data.user?.id ?? null);
        }
      } catch {
        // ignore
      }
    }

    loadJob();
    loadCurrentUser();
  }, [params.id]);

  const isOwner = currentUserId && job ? currentUserId === job.creator_id : false;
  const isFreelancer = job?.profiles?.role === "freelancer";

  const handleApply = () => {
    toast.info("投递功能正在全力开发中，敬请期待！");
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6">
        <div className="text-center space-y-4">
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

  const createdAt = job.created_at ? new Date(job.created_at) : null;
  const timeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "";

  return (
    <div className="p-6 space-y-6">
      {/* 面包屑 + 返回 */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-foreground transition-colors"
        >
          Dashboard
        </button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">任务详情</span>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主栏 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 标题 + 状态 Badge */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{job.title ?? "未命名任务"}</h1>
            <Badge
              variant={getStatusBadgeVariant(job.status)}
              className={`inline-flex items-center gap-1 transition-all duration-300 hover:scale-105 ${getStatusColor(job.status)}`}
            >
              {getStatusLabel(job.status)}
            </Badge>
          </div>

          {/* 发布者信息 */}
          {job.profiles && (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={job.profiles.avatar_url ?? ""} />
                <AvatarFallback>{job.profiles.full_name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{job.profiles.full_name ?? "匿名用户"}</div>
                <div className="text-sm text-muted-foreground">
                  {job.profiles.role === "client" ? "雇主" : "开发者"}
                </div>
              </div>
            </div>
          )}

          {/* 详细描述 */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">任务描述</h2>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground bg-muted/30 p-4 rounded-lg">
              {job.description?.trim() ? job.description : "暂无描述"}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-3 pt-4">
            {isOwner && (
              <>
                <Button variant="outline" onClick={() => router.push(`/dashboard/jobs/${job.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  编辑任务
                </Button>
                <Button variant="destructive" onClick={() => toast.info("关闭招聘功能开发中")}>
                  <UserX className="mr-2 h-4 w-4" />
                  关闭招聘
                </Button>
              </>
            )}
            {!isOwner && isFreelancer && (
              <Button size="lg" onClick={handleApply}>
                立即申请
              </Button>
            )}
          </div>
        </div>

        {/* 右侧侧边栏 */}
        <div className="space-y-6">
          {/* 预算与时间卡片 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">任务信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">💰 预算</span>
                <span className="font-bold text-lg">${job.budget ?? "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">📅 发布时间</span>
                <span className="text-sm">{timeAgo}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}