import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ClientView } from "@/components/dashboard/ClientView";
import { FreelancerView } from "@/components/dashboard/FreelancerView";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export default async function DashboardHomePage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  const fallback = (
    <div className="p-6 space-y-3">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  );

  // 映射 Prisma UserRole 到组件视图
  // creator -> freelancer, buyer -> client
  if (user?.role === "creator") {
    return (
      <Suspense fallback={fallback}>
        <FreelancerView />
      </Suspense>
    );
  }

  if (user?.role === "buyer") {
    return (
      <Suspense fallback={fallback}>
        <ClientView userId={session.user.id} />
      </Suspense>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">仪表盘</h1>
      <p className="mt-2 text-sm text-muted-foreground">未检测到有效的账户角色，请确保您已完成入驻。</p>
    </div>
  );
}
