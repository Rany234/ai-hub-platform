"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FreelancerView() {
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
    </div>
  );
}
