import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/jobs");
  }

  const { id } = await params;

  return (
    <DashboardPlaceholder
      title="任务详情已下线"
      description={`该功能模块已调整（原任务 ID: ${id}）。请前往【服务市场】或【我的订单】。`}
      type="deprecated"
    />
  );
}
