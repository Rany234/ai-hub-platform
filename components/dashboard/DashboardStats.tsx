import { DollarSign, Gavel, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

type DashboardStatsProps = {
  userId: string;
};

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  // 1. 获取已发布服务数量
  const publishedServices = await prisma.listing.count({
    where: { creatorId: userId },
  });

  // 2. 获取活跃订单数量（作为原"活跃竞标"的替代）
  const activeOrders = await prisma.order.count({
    where: {
      listing: { creatorId: userId },
      status: { in: ["pending", "paid", "delivered"] },
    },
  });

  // 3. 计算总收入（已完成订单的总额）
  const completedOrders = await prisma.order.aggregate({
    where: {
      listing: { creatorId: userId },
      status: "completed",
    },
    _sum: {
      amount: true,
    },
  });

  const totalEarnings = completedOrders._sum.amount ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-brand-border bg-brand-surface">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">总收入</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">¥{formatMoney(totalEarnings)}</div>
          <p className="text-xs text-muted-foreground mt-1">已完成结算的金额</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-brand-border bg-brand-surface">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">活跃订单</CardTitle>
          <Gavel className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{activeOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">进行中或待处理的订单</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-brand-border bg-brand-surface">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">已发布服务</CardTitle>
          <Package className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{publishedServices}</div>
          <p className="text-xs text-muted-foreground mt-1">在市场上架的服务项</p>
        </CardContent>
      </Card>
    </div>
  );
}
