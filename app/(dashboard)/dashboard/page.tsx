import { redirect } from "next/navigation";

import { ClientView } from "@/components/dashboard/ClientView";
import { FreelancerView } from "@/components/dashboard/FreelancerView";
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

  if (profile?.role === "client") {
    return <ClientView userId={user.id} />;
  }

  if (profile?.role === "freelancer") {
    return <FreelancerView />;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">仪表盘</h1>
      <p className="mt-2 text-sm text-muted-foreground">正在加载你的身份信息...</p>
    </div>
  );
}
