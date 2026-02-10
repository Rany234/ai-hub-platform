import { CreditCard, Clock, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type ClientStatsProps = {
  userId: string;
};

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export async function ClientStats({ userId }: ClientStatsProps) {
  const supabase = await createSupabaseServerClient();

  // 并行查询 Client 端数据
  const [
    { data: ordersData },
    { count: activeOrdersCount },
    { count: jobsCount },
  ] = await Promise.all([
    // 累计支出：orders 表中所有状态为已支付的订单总金额
    supabase
      .from("orders")
      .select("amount")
      .eq("buyer_id", userId)
      .not("status", "eq", "cancelled"), // 排除已取消的
    // 活跃订单：in_progress 状态
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("buyer_id", userId)
      .eq("status", "in_progress"),
    // 发布任务：jobs 表中创建的所有任务数
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", userId),
  ]);

  const totalSpent = ordersData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) ?? 0;
  const activeOrders = activeOrdersCount ?? 0;
  const publishedJobs = jobsCount ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-white/10 bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">累计支出</CardTitle>
          <CreditCard className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">¥{formatMoney(totalSpent)}</div>
          <p className="text-xs text-muted-foreground mt-1">在平台交易的总额</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-white/10 bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">活跃订单</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{activeOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">正在进行中的订单</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-white/10 bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">发布任务</CardTitle>
          <FileText className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{publishedJobs}</div>
          <p className="text-xs text-muted-foreground mt-1">已发布的定制化需求</p>
        </CardContent>
      </Card>
    </div>
  );
}
