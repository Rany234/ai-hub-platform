"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export function ClientView() {
  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-semibold">你好，雇主！准备好发布任务了吗？</h1>
        <p className="text-sm text-muted-foreground">管理你发布的任务，并找到合适的开发者</p>
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg">
          <Link href="/jobs/new">发布新任务</Link>
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">我发布的任务</h2>
        <div className="border rounded-lg p-6 text-center text-muted-foreground">
          暂无已发布的任务
        </div>
      </div>
    </div>
  );
}