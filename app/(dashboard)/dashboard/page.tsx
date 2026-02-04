import { Suspense } from "react";

import { redirect } from "next/navigation";

import { ClientView } from "@/components/dashboard/ClientView";
import { FreelancerView } from "@/components/dashboard/FreelancerView";
import { JobCardSkeleton } from "@/components/jobs/JobCardSkeleton";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">仪表盘</h1>
        <p className="mt-2 text-sm text-red-600">加载角色失败，请稍后重试。</p>
      </div>
    );
  }

  const fallback = (
    <div className="p-6 space-y-3">
      <JobCardSkeleton />
      <JobCardSkeleton />
      <JobCardSkeleton />
    </div>
  );

  if (profile?.role === "client") {
    return (
      <Suspense fallback={fallback}>
        <ClientView userId={user.id} />
      </Suspense>
    );
  }

  if (profile?.role === "freelancer") {
    return (
      <Suspense fallback={fallback}>
        <FreelancerView />
      </Suspense>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">仪表盘</h1>
      <p className="mt-2 text-sm text-muted-foreground">正在加载你的身份信息...</p>
    </div>
  );
}
