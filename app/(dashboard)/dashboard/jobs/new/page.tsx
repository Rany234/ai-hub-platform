import Link from "next/link";

import { Button } from "@/components/ui/button";
import { CreateJobForm } from "@/components/jobs/CreateJobForm";

export default function NewJobPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <nav className="flex text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link href="/dashboard" className="hover:text-foreground">Dashboard</Link></li>
            <li>/</li>
            <li><Link href="/dashboard/jobs" className="hover:text-foreground">Jobs</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">New Job</li>
          </ol>
        </nav>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">发布一个新需求</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            详细描述你的需求，吸引最优秀的 AI 开发者
          </p>
        </div>
        </div>
      </div>

      <CreateJobForm />
    </div>
  );
}