import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { ServiceOperations } from "./ServiceOperations";

export default async function MyServicesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/services");
  }

  const services = await prisma.listing.findMany({
    where: { creatorId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      metadata: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <nav className="flex text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">我的服务</li>
          </ol>
        </nav>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">我的服务管理</h1>
            <p className="text-sm text-muted-foreground mt-1">管理你发布的技能服务，持续优化你的报价与交付周期。</p>
          </div>
          <Button asChild className="bg-white text-black hover:bg-slate-200 font-medium border-none shadow-lg">
            <Link href="/dashboard/listings/new">➕ 发布新服务</Link>
          </Button>
        </div>
      </div>

      {services.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-[#151F32] p-12 text-center text-slate-500">
          你还没有发布任何服务。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service) => {
            const packages = (service.metadata as any)?.packages;
            const basic = packages?.basic;
            const price = typeof basic?.price === "number" ? basic.price : 0;
            const deliveryDays = typeof basic?.delivery_days === "number" ? basic.delivery_days : "-";

            return (
              <Card
                key={service.id}
                className="rounded-2xl shadow-xl transition-all border-white/10 bg-[#151F32] overflow-hidden flex flex-col group hover:border-brand-action/30"
              >
                <CardHeader className="pb-4 border-b border-white/5 bg-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base line-clamp-1 flex items-center gap-2 text-slate-100">
                      <Package className="size-4 text-brand-action" />
                      {service.title}
                    </CardTitle>
                    <ServiceOperations serviceId={service.id} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{service.description || "(无描述)"}</p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                    <div className="text-brand-action font-bold">¥{Number(price).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <CalendarClock className="size-3" />
                      {deliveryDays} 天交付
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
