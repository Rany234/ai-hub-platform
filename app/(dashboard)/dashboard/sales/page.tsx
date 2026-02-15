import { redirect } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { StatusBadge } from "@/components/StatusBadge";

export default async function SalesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/sales");
  }

  const orders = await prisma.order.findMany({
    where: {
      listing: {
        creatorId: session.user.id,
      },
    },
    include: {
      listing: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingDeliveryCount = orders.filter((o) => o.status === "paid").length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">销售看板</h1>

      {pendingDeliveryCount > 0 ? (
        <div className="mt-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          你有 <span className="font-semibold">{pendingDeliveryCount}</span> 个新订单待交付。
        </div>
      ) : null}

      {orders.length === 0 ? (
        <div className="mt-6 border rounded-lg p-6">
          <p className="text-sm text-muted-foreground">暂无销售订单</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left font-medium p-3">服务</th>
                <th className="text-left font-medium p-3">价格</th>
                <th className="text-left font-medium p-3">状态</th>
                <th className="text-right font-medium p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b last:border-b-0">
                  <td className="p-3 font-mono">{order.listing?.title ?? order.listingId}</td>
                  <td className="p-3">¥{order.amount}</td>
                  <td className="p-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-3 text-right">
                    <a className="underline" href={`/dashboard/orders/${encodeURIComponent(order.id)}`}>
                      查看
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
