import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CreateJobForm } from "@/components/jobs/CreateJobForm";

export default function NewJobPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">发布一个新需求</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            详细描述你的需求，吸引最优秀的 AI 开发者
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard">返回控制台</Link>
        </Button>
      </div>

      <CreateJobForm />
    </div>
  );
}