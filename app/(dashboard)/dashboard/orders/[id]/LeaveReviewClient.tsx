"use client";

import { DashboardPlaceholder } from "@/components/dashboard/DashboardPlaceholder";
import { Star } from "lucide-react";

export function LeaveReviewClient() {
  return (
    <DashboardPlaceholder
      title="评价功能正在迁移"
      description="我们正在将系统全面升级为服务市场模式。评价系统正在重构中，敬请期待。"
      type="coming-soon"
      icon={Star}
    />
  );
}
