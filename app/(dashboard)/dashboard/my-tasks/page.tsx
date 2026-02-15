import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { ListChecks } from "lucide-react";

export default async function MyTasksPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/my-tasks");
  }

  return (
    <DashboardPlaceholder
      title="任务模块已下线"
      description="该模块属于旧版发包/投标模式，现已全面转向服务市场。请前往【服务市场】浏览服务，或在【我的订单】中管理交易。"
      type="deprecated"
      icon={ListChecks}
    />
  );
}
