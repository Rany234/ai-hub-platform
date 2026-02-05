import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, BadgeCheck, CalendarClock, Coins, Hammer } from "lucide-react";

import FormattedDate from "@/components/jobs/FormattedDate";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { getJobById } from "@/app/actions/job";

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

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = (await getJobById(params.id)) as JobWithProfile | null;

  if (!job) {
    return notFound();
  }

  const profile =
    Array.isArray(job?.profiles) && job.profiles.length > 0 ? job.profiles[0] : null;

  const budget = job?.budget ? Number(job?.budget) : 0;
  const description = job?.description || "暂无详细描述";

  const createdAt = job?.created_at ?? null;

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
              <ReactMarkdown>
                {description?.trim() ? description : "暂无描述"}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6 space-y-6">
            <div className="rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-600 via-indigo-700 to-indigo-900 p-6 text-white">
                <div className="text-sm/6 opacity-90">预算</div>
                <div className="mt-2 text-3xl font-extrabold tracking-tight font-mono">
                  ${budget ? budget : "-"}
                </div>
                {createdAt ? (
                  <div className="mt-4 inline-flex items-center gap-2 text-sm/6 opacity-90">
                    <CalendarClock className="h-4 w-4" />
                    <span>
                      <FormattedDate date={createdAt} />
                    </span>
                  </div>
                ) : null}
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

            <Button
              size="lg"
              className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-900 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] shadow-blue-500/50 transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
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