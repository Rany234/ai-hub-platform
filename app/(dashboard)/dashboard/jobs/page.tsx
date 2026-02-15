import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";

export default async function JobMarketplacePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/jobs");
  }

  return (
    <DashboardPlaceholder
      title="发包模式已下线"
      description="该功能模块已调整。请前往【服务市场】浏览服务，或在【我的订单】中管理你的交易。"
      type="deprecated"
    />
  );
}
