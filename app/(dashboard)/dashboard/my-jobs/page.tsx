import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { Briefcase } from "lucide-react";

export default async function MyJobsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/my-jobs");
  }

  return (
    <DashboardPlaceholder
      title="工作台功能已下线"
      description="该模块属于旧版发包模式，现已全面转向服务市场。请在【服务市场】中管理您的服务，或在【我的订单】中查看交易。"
      type="deprecated"
      icon={Briefcase}
    />
  );
}
