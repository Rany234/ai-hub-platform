import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function FreelancerView() {
  const supabase = await createSupabaseServerClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("id, title, budget, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">你好，开发者！来看看今天的新机会。</h1>
          <p className="text-sm text-muted-foreground">浏览任务广场，找到适合你的项目</p>
        </div>

        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/jobs">浏览任务广场</Link>
          </Button>
        </div>

        <div className="rounded-lg border p-4 text-sm text-red-600">加载最新任务失败，请稍后重试。</div>
      </div>
    );
  }

  const hasJobs = Array.isArray(jobs) && jobs.length > 0;

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">你好，开发者！来看看今天的新机会。</h1>
        <p className="text-sm text-muted-foreground">浏览任务广场，找到适合你的项目</p>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/jobs">浏览任务广场</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">统计 1</CardTitle>
          </CardHeader>
          <CardContent className="h-16" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">统计 2</CardTitle>
          </CardHeader>
          <CardContent className="h-16" />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">统计 3</CardTitle>
          </CardHeader>
          <CardContent className="h-16" />
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">最新任务广场</h2>
          <Button asChild variant="outline">
            <Link href="/jobs">查看全部</Link>
          </Button>
        </div>

        {hasJobs ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-base font-medium hover:underline"
                  >
                    {job.title}
                  </Link>
                  <span className="text-sm font-semibold text-green-600">
                    ¥{Number(job.budget).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>状态: {job.status === "open" ? "开放" : job.status === "in_progress" ? "进行中" : "已完成"}</span>
                  <span>{new Date(job.created_at).toLocaleDateString("zh-CN")}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center text-muted-foreground">暂无最新任务</div>
        )}
      </div>
    </div>
  );
}
