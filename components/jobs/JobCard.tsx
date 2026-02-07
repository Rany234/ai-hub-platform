"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, User, Flame } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { deleteJob } from "@/app/actions/job";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BidDrawer } from "@/components/bids/BidDrawer";

type JobLike = {
  id?: string;
  title?: string;
  description?: string | null;
  budget?: number | string | null;
  status?: string | null;
  created_at?: string | Date | null;
  creator_id?: string | null;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  } | null;
  bid_count?: number;
};

type JobCardProps = {
  job: any;
  isOwner?: boolean;
  userId?: string;
};

function getStatusBadgeStyles(status?: string | null) {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200";
    case "in_progress":
      return "bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200";
    case "completed":
      return "bg-green-100 text-green-700 hover:bg-green-100 border-green-200";
    default:
      return "bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200";
  }
}

function getStatusLabel(status?: string | null) {
  if (status === "open") return "招募中";
  if (status === "in_progress") return "进行中";
  if (status === "completed") return "已结项";
  if (status === "closed") return "已关闭";
  return status ?? "未知状态";
}

export function JobCard({ job, isOwner, userId }: JobCardProps) {
  const router = useRouter();
  const j = job as JobLike;

  // 清空测试数据逻辑：纯数字且长度 > 5
  const isNumericTitle = j.title && /^\d+$/.test(j.title) && j.title.length > 5;
  const displayTitle = isNumericTitle ? "[未命名 AI 需求]" : (j.title ?? "未命名任务");

  const ownerByProp = typeof isOwner === "boolean" ? isOwner : undefined;
  const ownerByUserId = userId && j.creator_id ? userId === j.creator_id : undefined;
  const resolvedIsOwner = ownerByProp ?? ownerByUserId ?? false;

  const createdAt = j.created_at ? new Date(j.created_at) : null;
  const createdAtText = createdAt ? format(createdAt, "yyyy-MM-dd") : "";

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!j.id) return;
    
    const confirmed = confirm("确定要删除这个任务吗？");
    if (!confirmed) return;

    const toastId = toast.loading("正在删除...");
    
    try {
      await deleteJob(j.id);
      toast.success("任务已删除", { id: toastId });
    } catch (error) {
      const message = error instanceof Error ? error.message : "删除失败，请稍后重试";
      toast.error(message, { id: toastId });
    }
  };

  return (
    <Card 
      onClick={() => j.id && router.push(`/dashboard/jobs/${j.id}`)}
      className="group cursor-pointer border-white/10 bg-white/50 transition-all duration-300 hover:border-indigo-500/30 hover:bg-white hover:shadow-lg hover:shadow-indigo-500/5"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`${getStatusBadgeStyles(j.status)} font-medium px-2 py-0`}>
                {getStatusLabel(j.status)}
              </Badge>
              {j.bid_count !== undefined && j.bid_count > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-orange-600">
                  <Flame className="h-3 w-3 fill-orange-600" />
                  {j.bid_count} 人已投标
                </span>
              )}
            </div>
            
            <h3 className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              {displayTitle}
            </h3>

            {/* 卖家预览 */}
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6 border border-white/20">
                <AvatarImage src={j.profiles?.avatar_url ?? undefined} />
                <AvatarFallback className="bg-slate-100 text-[10px]">
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-slate-500">{j.profiles?.username ?? "匿名发布者"}</span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-400">{createdAtText}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-indigo-600">
              ¥{typeof j.budget === "number" ? j.budget.toLocaleString() : j.budget}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">任务预算</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">
          {j.description?.trim() ? j.description : "暂无详细需求描述"}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t border-slate-50 pt-4 bg-slate-50/30">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock className="h-3.5 w-3.5" />
          <span>发布于 {createdAtText}</span>
        </div>

        <div className="flex items-center gap-2">
          {resolvedIsOwner ? (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  j.id && router.push(`/dashboard/jobs/${j.id}/edit`);
                }}
              >
                编辑
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-red-500 hover:bg-red-50 hover:text-red-600" 
                onClick={handleDelete}
              >
                删除
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                size="sm" 
                className="h-8 px-4 text-xs font-medium"
              >
                详情
              </Button>
              {j.id && j.status === "open" && (
                <div onClick={(e) => e.stopPropagation()}>
                  <BidDrawer 
                    jobId={j.id} 
                    jobTitle={displayTitle}
                    trigger={
                      <Button 
                        size="sm" 
                        className="h-8 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                      >
                        立即投标
                      </Button>
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
