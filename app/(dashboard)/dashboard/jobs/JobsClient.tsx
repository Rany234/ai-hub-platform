"use client";

import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { Briefcase } from "lucide-react";

export function JobsClient() {
  return (
    <DashboardPlaceholder
      title="任务广场已下线"
      description="该模块属于旧版发包模式。请前往【服务市场】浏览服务，或在【我的订单】中管理你的交易。"
      type="deprecated"
      icon={Briefcase}
    />
  );
}
