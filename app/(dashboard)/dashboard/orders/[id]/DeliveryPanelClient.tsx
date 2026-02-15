"use client";

import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { PackageCheck } from "lucide-react";

export function DeliveryPanelClient() {
  return (
    <DashboardPlaceholder
      title="交付功能正在迁移"
      description="我们正在将系统全面升级为服务市场模式。交付/验收功能即将上线。"
      type="coming-soon"
      icon={PackageCheck}
    />
  );
}
