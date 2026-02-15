import Link from "next/link";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

type DashboardJobListProps = {
  userId: string;
  role: "client" | "freelancer";
};

export async function DashboardJobList({ userId, role }: DashboardJobListProps) {
  // 1. 根据角色构建查询条件
  const where = role === "client" 
    ? { buyerId: userId } 
    : { listing: { creatorId: userId } };

  // 2. 查询订单数据（包含买家、服务及最近一条交付）
  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      buyer: {
        select: { name: true, email: true }
      },
      listing: {
        include: {
          creator: {
            select: { name: true, email: true }
          }
        }
      },
      deliveries: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  // 3. 序列化数据（处理 Date 类型）
  const serializedOrders = serializePrisma(orders);

  if (!serializedOrders || serializedOrders.length === 0) {
    return (
      <EmptyState
        title="暂无订单"
        description={role === "client" ? "您还没有购买过任何服务。" : "目前还没有收到任何订单，请继续优化您的服务。"}
        actionLabel={role === "client" ? "浏览服务市场" : "管理我的服务"}
        href={role === "client" ? "/listings" : "/dashboard/listings"}
      />
    );
  }

  return (
    <div className="space-y-4">
      {serializedOrders.map((order: any) => {
        const opponentName = role === "client" 
          ? (order.listing.creator.name || order.listing.creator.email)
          : (order.buyer.name || order.buyer.email);
        
        const lastDelivery = order.deliveries?.[0];

        return (
          <div 
            key={order.id}
            className="group relative rounded-2xl border border-white/5 bg-[#151F32] p-5 transition-all hover:border-amber-500/30 hover:bg-[#1c2841] shadow-sm"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 group-hover:text-amber-500 transition-colors">
                    {order.listing.title}
                  </h3>
                  <Badge variant="secondary" className="bg-white/5 text-slate-400 border-none text-[10px]">
                    ID: {order.id.slice(-6).toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    {role === "client" ? "卖家: " : "买家: "}
                    <span className="text-slate-200">{opponentName}</span>
                  </span>
                  <span>
                    创建于: {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm", { locale: zhCN })}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6">
                <div className="text-right">
                  <div className="text-lg font-black text-amber-500">¥{order.amount.toFixed(2)}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Order Amount</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {translateStatus(order.status)}
                  </Badge>
                  {lastDelivery && (
                    <span className="text-[10px] text-slate-500">
                      最新交付状态: <span className="text-amber-500/80">{lastDelivery.status}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Link 
              href={`/dashboard/orders/${order.id}`}
              className="absolute inset-0 z-10"
              aria-label="查看订单详情"
            />
          </div>
        );
      })}
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "paid": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "delivered": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "completed": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "disputed": return "bg-red-500/10 text-red-400 border-red-500/20";
    default: return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function translateStatus(status: string) {
  const map: Record<string, string> = {
    pending: "待支付",
    paid: "已支付/待交付",
    delivered: "已交付/待验收",
    completed: "已完成",
    disputed: "争议中",
  };
  return map[status] || status;
}
