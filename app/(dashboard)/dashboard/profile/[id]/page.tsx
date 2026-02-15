import { notFound, redirect } from "next/navigation";
import { Star, Trophy, CalendarClock, MessageSquareQuote } from "lucide-react";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect(`/login?redirectedFrom=/dashboard/profile/${encodeURIComponent(id)}`);
  }

  if (!id) return notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) return notFound();

  const services = await prisma.listing.findMany({
    where: {
      creatorId: user.id,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      metadata: true,
      createdAt: true,
    },
  });

  const completedOrdersCount = await prisma.order.count({
    where: {
      listing: { creatorId: user.id },
      status: "completed",
    },
  });

  const isMe = session.user.id === user.id;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="relative bg-[#151F32] rounded-3xl border border-[#334155] shadow-2xl overflow-hidden p-8">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <Avatar className="h-32 w-32 border-4 border-[#334155] shadow-2xl">
            <AvatarImage src={user.image ?? ""} />
            <AvatarFallback className="text-4xl bg-[#0B1121] text-slate-400">{user.name?.[0] ?? "U"}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white">{user.name ?? "匿名用户"}</h1>
                <p className="text-lg text-brand-action font-medium">
                  {user.role === "creator" ? "创作者" : "买家"}
                </p>
              </div>
              {isMe ? (
                <div className="text-sm text-slate-500">设置入口在「用户设置」</div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-6 justify-center md:justify-start text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                <span className="font-bold text-slate-100">-</span>
                <span>评分</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-400" />
                <span className="font-bold text-slate-100">{completedOrdersCount}</span>
                <span>已完成订单</span>
              </div>
            </div>

            {user.email ? (
              <div className="text-xs text-slate-500">{user.email}</div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="rounded-2xl shadow-xl border-[#334155] bg-[#151F32]">
            <CardHeader>
              <CardTitle className="text-lg text-white">关于我</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">
                服务市场模式下，个人简介功能正在迁移中。
              </p>
              <div className="space-y-2 pt-4 border-t border-[#334155]">
                <div className="text-sm font-semibold text-slate-200">技能</div>
                <span className="text-sm text-slate-500">暂未启用</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-white">服务列表</h2>
              {isMe ? (
                <a className="text-sm underline text-slate-400 hover:text-white" href="/dashboard/listings/new">
                  发布新服务
                </a>
              ) : null}
            </div>

            {services.length === 0 ? (
              <EmptyState title="暂无服务" description="尚未发布任何服务" icon={CalendarClock} />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {services.map((service) => {
                  const packages = (service.metadata as any)?.packages;
                  const deliveryDays = packages?.basic?.delivery_days;

                  return (
                    <Card
                      key={service.id}
                      className="rounded-2xl shadow-xl hover:shadow-2xl transition-all border-[#334155] bg-[#151F32] overflow-hidden flex flex-col"
                    >
                      <CardHeader className="bg-black/20 pb-4 border-b border-[#334155]">
                        <CardTitle className="text-base line-clamp-1 text-white">{service.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{service.description}</p>
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                          <div className="text-brand-action font-bold">¥{Number(service.price).toLocaleString()}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-1">
                            <CalendarClock className="size-3" />
                            {typeof deliveryDays === "number" ? `${deliveryDays} 天交付` : "-"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6 pt-4 border-t border-[#334155]">
            <h2 className="text-2xl font-bold text-white px-2">收到的评价</h2>
            <EmptyState title="评价系统正在迁移" description="评价功能即将上线" icon={MessageSquareQuote} />
          </section>
        </div>
      </div>
    </div>
  );
}
