import { DollarSign, Gavel, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type DashboardStatsProps = {
  userId: string;
};

function formatMoney(value: unknown) {
  const num = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(num)) return "0.00";
  return num.toFixed(2);
}

export async function DashboardStats({ userId }: DashboardStatsProps) {
  const supabase = await createSupabaseServerClient();

  const [{ data: wallet }, bidsResult, listingsResult] = await Promise.all([
    supabase.from("wallets").select("balance").eq("user_id", userId).maybeSingle(),
    supabase
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("bidder_id", userId)
      .eq("status", "pending"),
    supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("creator_id", userId),
  ]);

  let activeBids = bidsResult.count ?? 0;
  if (bidsResult.error) {
    // TODO: 待数据库 bids 表增加 status 字段后开启过滤。
    const fallbackBids = await supabase
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("bidder_id", userId);
    activeBids = fallbackBids.count ?? 0;
  }

  const publishedServices = listingsResult.count ?? 0;

  // 总收入：当前实现使用钱包余额作为已完成结算金额的近似值。
  // 若后续需要按 orders.completed 精确统计，可在此替换为聚合查询。
  const totalEarnings = wallet?.balance ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-2xl shadow-sm border-white/10 bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">总收入</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">¥{formatMoney(totalEarnings)}</div>
          <p className="text-xs text-muted-foreground mt-1">已完成结算的金额</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-white/10 bg-white/50 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">活跃竞标</CardTitle>
          <Gavel className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono">{activeBids}</div>
          <p className="text-xs text-muted-foreground mt-1">等待雇主响应的投标</p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-sm border-white/10 bg-white/50 backdrop-blur-sm">
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
