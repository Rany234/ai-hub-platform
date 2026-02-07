import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock, Package } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { ServiceOperations } from "./ServiceOperations";

export default async function MyServicesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/services");
  }

  const { data: services, error } = await supabase
    .from("listings")
    .select("id,title,description,packages,created_at")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <nav className="flex text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
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
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/listings/new">➕ 发布新服务</Link>
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}

      {!services || services.length === 0 ? (
        <div className="rounded-3xl border border-dashed bg-slate-50 p-12 text-center text-slate-500">
          你还没有发布任何服务。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service: any) => (
            <Card key={service.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow border-slate-100 overflow-hidden flex flex-col">
              <CardHeader className="bg-slate-50/50 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base line-clamp-1 flex items-center gap-2">
                    <Package className="size-4 text-blue-600" />
                    {service.title}
                  </CardTitle>
                  <ServiceOperations serviceId={service.id} />
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col justify-between gap-4">
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {service.description || "(无描述)"}
                </p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <div className="text-blue-600 font-bold">
                    ¥{Number(service.packages?.basic?.price ?? 0).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <CalendarClock className="size-3" />
                    {service.packages?.basic?.delivery_days ?? "-"} 天交付
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
