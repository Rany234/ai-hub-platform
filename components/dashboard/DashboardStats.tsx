import { DollarSign, Gavel, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type DashboardStatsProps = {
  userId: string;
};

type AccentKind = "revenue" | "activeBids" | "services";

function getAccentBorderClass(kind: AccentKind) {
  if (kind === "revenue") return "border-l-emerald-500";
  if (kind === "activeBids") return "border-l-brand-primary";
  return "border-l-purple-500";
}

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
    const fallbackBids = await supabase
      .from("bids")
      .select("*", { count: "exact", head: true })
      .eq("bidder_id", userId);
    activeBids = fallbackBids.count ?? 0;
  }

  const publishedServices = listingsResult.count ?? 0;
  const totalEarnings = wallet?.balance ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
        className={`rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-indigo-100/20 dark:border-white/5 border-l-[4px] ${getAccentBorderClass(
          "revenue"
        )} transition-all duration-200 hover:shadow-glow hover:-translate-y-1`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-gray-500">总收入</CardTitle>
          <DollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
            ¥{formatMoney(totalEarnings)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">已完成结算的金额</p>
        </CardContent>
      </Card>

      <Card
        className={`rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-indigo-100/20 dark:border-white/5 border-l-[4px] ${getAccentBorderClass(
          "activeBids"
        )} transition-all duration-200 hover:shadow-glow hover:-translate-y-1`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-gray-500">活跃竞标</CardTitle>
          <Gavel className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{activeBids}</div>
          <p className="text-xs text-muted-foreground mt-1">等待雇主响应的投标</p>
        </CardContent>
      </Card>

      <Card
        className={`rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-sm border border-indigo-100/20 dark:border-white/5 border-l-[4px] ${getAccentBorderClass(
          "services"
        )} transition-all duration-200 hover:shadow-glow hover:-translate-y-1`}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xs uppercase tracking-wider text-gray-500">已发布服务</CardTitle>
          <Package className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
            {publishedServices}
          </div>
          <p className="text-xs text-muted-foreground mt-1">在市场上架的服务项</p>
        </CardContent>
      </Card>
    </div>
  );
}
