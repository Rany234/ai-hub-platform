import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function DashboardHomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">仪表盘</h1>
      <p className="mt-2 text-sm text-muted-foreground">请选择你的身份入口：</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold">我是买家</h2>
          <p className="mt-2 text-sm text-muted-foreground">查看你的购买记录与订单状态。</p>
          <Link className="inline-block mt-4 rounded-md bg-black text-white px-4 py-2" href="/dashboard/orders">
            我的订单
          </Link>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold">我是创作者</h2>
          <p className="mt-2 text-sm text-muted-foreground">管理你的销售订单，并发布新的作品。</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-md border px-4 py-2" href="/dashboard/sales">
              销售看板
            </Link>
            <Link className="rounded-md bg-black text-white px-4 py-2" href="/dashboard/listings/new">
              发布新作品
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
