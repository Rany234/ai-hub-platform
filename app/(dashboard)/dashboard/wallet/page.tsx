import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { 
  Wallet, 
  ShoppingBag, 
  TrendingUp, 
  Coins, 
  PlusCircle,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function WalletPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/wallet");
  }

  // 获取用户信息及收益余额
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      earningsBalance: true,
    }
  });

  if (!user) {
    redirect("/login");
  }

  // 获取总销量 (已支付的订单数量)
  const totalSales = await prisma.order.count({
    where: {
      listing: {
        creatorId: session.user.id
      },
      status: 'paid'
    }
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-8 h-8 text-amber-500" />
            我的钱包
          </h1>
          <p className="text-slate-400 mt-1">管理您的创作收益与资金账户</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 创作收益卡片 */}
        <Card className="md:col-span-2 bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-amber-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              创作收益 (Creator Earnings)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-white">
                ¥{user.earningsBalance.toFixed(2)}
              </span>
              <span className="text-slate-500 text-sm">可用余额</span>
            </div>
            <div className="mt-6 flex gap-3">
              <Button disabled className="bg-amber-600 hover:bg-amber-700 text-white">
                申请提现
              </Button>
              <Button variant="outline" className="border-slate-700 text-slate-300">
                收支明细
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 销量统计卡片 */}
        <Card className="bg-[#151F32] border-[#334155]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              销量统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold text-white">{totalSales}</div>
                <div className="text-xs text-slate-500">已售出服务 (单)</div>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <div className="text-2xl font-bold text-white">90%</div>
                <div className="text-xs text-slate-500">创作者分成比例</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 发布服务 CTA 卡片 */}
      <Card className="bg-[#151F32] border-dashed border-[#334155] relative overflow-hidden group">
        <div className="absolute right-0 top-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <PlusCircle className="w-32 h-32" />
        </div>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            发布新服务 (Create New Listing)
          </CardTitle>
          <CardDescription className="text-slate-400 max-w-md">
            将您的 AI 技能、Prompt 或模型封装成服务，向社区开放。每笔成交您都将获得成交额 90% 的收益。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-white text-black hover:bg-slate-200">
            <Link href="/dashboard/listings/new" className="flex items-center gap-2">
              立即发布 <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* 原有消费账户占位 */}
      <div className="pt-8 border-t border-slate-800">
        <div className="flex items-center gap-2 text-slate-400 mb-6">
          <Coins className="w-5 h-5" />
          <h2 className="text-xl font-semibold">消费账户</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
          <Card className="bg-[#151F32] border-[#334155] border-dashed">
            <CardContent className="pt-6 text-center py-10">
              <p className="text-slate-500 text-sm">充值功能即将开放</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
