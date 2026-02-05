"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

type JobLike = {
  id?: string;
  title?: string;
  description?: string | null;
  budget?: number | string | null;
  status?: string | null;
  created_at?: string | Date | null;
  creator_id?: string | null;
};

type JobCardProps = {
  job: any;
  isOwner?: boolean;
  userId?: string;
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

export function JobCard({ job, isOwner, userId }: JobCardProps) {
  const router = useRouter();
  const j = job as JobLike;

  const ownerByProp = typeof isOwner === "boolean" ? isOwner : undefined;
  const ownerByUserId = userId && j.creator_id ? userId === j.creator_id : undefined;
  const resolvedIsOwner = ownerByProp ?? ownerByUserId ?? false;

  const createdAt = j.created_at ? new Date(j.created_at) : null;
  const timeAgo = createdAt ? formatDistanceToNow(createdAt, { addSuffix: true }) : "";

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {j.id ? (
              <button
                type="button"
                onClick={() => j.id && router.push(`/dashboard/jobs/${j.id}`)}
                className="block truncate text-left text-lg font-semibold hover:underline"
              >
                {j.title ?? "未命名任务"}
              </button>
            ) : (
              <div className="truncate text-lg font-semibold">{j.title ?? "未命名任务"}</div>
            )}
          </div>
          <Badge variant={getStatusBadgeVariant(j.status)} className={j.status === "open" ? "bg-green-600 text-white" : undefined}>
            {getStatusLabel(j.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {j.description?.trim() ? j.description : "暂无描述"}
        </p>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="font-semibold">💰 ${j.budget ?? "-"}</div>
          <div className="text-xs text-muted-foreground">{timeAgo}</div>
        </div>

        <div className="flex items-center gap-2">
          {resolvedIsOwner ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={j.id ? `/dashboard/jobs/${j.id}/edit` : "/dashboard/jobs"}>编辑</Link>
              </Button>
              <Button variant="destructive" size="sm">删除</Button>
            </>
          ) : (
            <Button size="sm" onClick={() => j.id && router.push(`/dashboard/jobs/${j.id}`)}>
              查看详情
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
