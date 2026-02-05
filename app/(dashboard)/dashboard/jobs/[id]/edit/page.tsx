import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditJobPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">编辑任务</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            修改任务信息，让开发者更好地了解你的需求
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/jobs">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>正在开发编辑功能：{params.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            编辑任务的功能正在开发中，敬请期待。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}