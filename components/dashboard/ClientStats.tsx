import { CreditCard, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";

type ClientStatsProps = {
  userId: string;
};

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export async function ClientStats({ userId }: ClientStatsProps) {
  // 1. 累计支出：所有状态非 cancelled 的订单总额
  const stats = await prisma.order.aggregate({
    where: {
      buyerId: userId,
      status: { not: "disputed" }, // 适配现有 OrderStatus 枚举
    },
    _sum: {
      amount: true,
    },
  });

  // 2. 活跃订单：进行中状态的订单
  const activeOrdersCount = await prisma.order.count({
    where: {
      buyerId: userId,
      status: { in: ["pending", "paid", "delivered"] },
    },
  });

  // 3. 已完成订单数
  const completedOrdersCount = await prisma.order.count({
    where: {
      buyerId: userId,
      status: "completed",
    },
  });

  const totalSpent = stats._sum.amount ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-brand-border bg-brand-surface">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">累计支出</CardTitle>
          <CreditCard className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">¥{formatMoney(totalSpent)}</div>
          <p className="text-xs text-muted-foreground mt-1">在平台交易的总额</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-brand-border bg-brand-surface">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">活跃订单</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{activeOrdersCount}</div>
          <p className="text-xs text-muted-foreground mt-1">正在进行中的订单</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-brand-border bg-brand-surface">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">已完成</CardTitle>
          <FileText className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{completedOrdersCount}</div>
          <p className="text-xs text-muted-foreground mt-1">已成功结项的服务</p>
        </CardContent>
      </Card>
    </div>
  );
}
