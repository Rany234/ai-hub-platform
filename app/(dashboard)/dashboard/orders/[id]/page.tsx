import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { OrderStepper } from "@/features/orders/components/OrderStepper";
import { PayButtonClient } from "@/features/orders/components/PayButtonClient";
import { StatusBadge } from "@/components/StatusBadge";
import { Archive, FileText, Clock, CheckCircle2, Link as LinkIcon } from "lucide-react";
import DeliveryForm from "./DeliveryForm";
import DownloadButtonClient from "./DownloadButtonClient";
import { RequirementBox } from "./RequirementBox";
import { OrderTimeline } from "./OrderTimeline";
import AcceptanceButton from "./AcceptanceButton";

function formatFundStatus(orderStatus: string | null | undefined) {
  if (!orderStatus) return "未知";
  if (orderStatus === "pending") return "等待支付";
  if (orderStatus === "paid" || orderStatus === "delivered") return "资金安全托管中 (Escrow Active)";
  if (orderStatus === "completed") return "资金已释放";
  return "未知";
}

export default async function OrderCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const { id } = await params;
  const sp = await searchParams;

  if (!session?.user?.id) {
    redirect(`/login?redirectedFrom=/dashboard/orders/${encodeURIComponent(id)}`);
  }

  const success = sp.success === "true";
  const canceled = sp.canceled === "true";

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      listing: {
        include: { creator: true },
      },
      buyer: true,
      deliveries: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">订单未找到</h1>
        <p className="mt-4 text-sm text-red-600">该订单不存在或已被删除。</p>
      </div>
    );
  }

  const userId = session.user.id;
  const isBuyer = order.buyerId === userId;
  const isSeller = order.listing?.creatorId === userId;

  if (!isBuyer && !isSeller) {
    return <p className="p-6 text-sm text-muted-foreground">你无权操作该订单。</p>;
  }

  const metadata = (order.metadata as any) ?? {};
  const requirements = metadata?.requirements ?? "";
  const requirementsUpdatedAt = metadata?.requirements_updated_at ? new Date(metadata.requirements_updated_at) : undefined;

  const showBuyerPay = isBuyer && order.status === "pending";
  const showSellerDeliveryForm = isSeller && (order.status === "paid" || order.status === "delivered");
  const showBuyerWaiting =
    isBuyer &&
    order.status === "paid" &&
    order.listing?.type !== "ASSET" &&
    (!order.deliveries || order.deliveries.length === 0);

  const showAssetAutoDelivery =
    isBuyer &&
    (order.status === "paid" || order.status === "completed") &&
    order.listing?.type === "ASSET" &&
    Boolean(order.listing?.attachmentUrl);

  const deliveredAt = order.deliveries?.[0]?.createdAt ? new Date(order.deliveries[0].createdAt) : undefined;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-4 text-emerald-400">
          <div className="font-bold">支付成功！</div>
          <div className="mt-0.5 text-xs">资金已安全托管。</div>
        </div>
      )}

      {canceled && (
        <div className="mb-4 rounded-md border border-yellow-900/50 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-400">
          支付已取消。
        </div>
      )}

      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">订单详情</h1>
        <a className="text-sm underline text-slate-400" href={`/listings/${order.listingId}`}>
          查看服务
        </a>
      </div>

      <div className="mt-6">
        <OrderStepper currentStatus={order.status} />
      </div>

      <div className="mt-6 border border-brand-border bg-brand-surface rounded-xl p-6 shadow-xl">
        {requirements ? (
          <div className="bg-black/20 p-4 rounded-lg border border-brand-border mb-6">
            <div className="text-sm font-bold text-slate-200">需求描述</div>
            <div className="mt-2 text-sm text-slate-400 whitespace-pre-wrap">{requirements}</div>
            {requirementsUpdatedAt ? (
              <div className="mt-2 text-xs text-slate-500">最后更新：{requirementsUpdatedAt.toLocaleString()}</div>
            ) : null}
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">订单号</div>
            <div className="mt-1 font-mono text-slate-300">{order.id}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">当前状态</div>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase">资金状态</div>
              <div className="mt-1 text-slate-300">{formatFundStatus(order.status)}</div>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase">服务</div>
            <div className="mt-1 text-slate-200 font-semibold">{order.listing?.title}</div>
          </div>
          <div className="pt-4 border-t border-brand-border flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-500 uppercase">总价</span>
            <span className="text-2xl font-bold text-brand-action">¥{order.amount}</span>
          </div>
        </div>

        {showBuyerPay ? (
          <div className="mt-6">
            <PayButtonClient orderId={order.id} />
          </div>
        ) : null}
      </div>

      <div className="mt-8 bg-[#151F32] border border-white/10 rounded-2xl p-6 shadow-xl">
        <OrderTimeline
          status={order.status as any}
          createdAt={new Date(order.createdAt)}
          paidAt={order.status !== "pending" ? new Date(order.createdAt) : undefined}
          deliveredAt={deliveredAt}
          completedAt={order.status === "completed" ? new Date(order.createdAt) : undefined}
          hasRequirements={Boolean(requirements && String(requirements).trim().length > 0)}
        />
      </div>

      {showAssetAutoDelivery ? (
        <div className="mt-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 shadow-xl">
          <div className="flex items-center gap-2 text-emerald-300 font-bold">
            <LinkIcon className="h-5 w-5" />
            您的数字资产已准备就绪
          </div>
          <div className="mt-2 text-sm text-slate-300 break-all">{order.listing?.attachmentUrl}</div>
          <div className="mt-4">
            <a
              href={order.listing?.attachmentUrl ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-emerald-400 transition-colors"
            >
              立即下载 / 访问资源
            </a>
          </div>
          <div className="mt-3 text-xs text-emerald-200/80">提示：无需等待卖家人工交付。</div>
        </div>
      ) : showBuyerWaiting ? (
        <div className="mt-8 bg-amber-900/10 border border-amber-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-amber-200 font-bold">
            <Clock className="h-5 w-5" />
            等待卖家交付中...
          </div>
          <div className="mt-2 text-sm text-slate-400">卖家交付后，你将在下方看到交付成果并可下载附件。</div>
        </div>
      ) : null}

      {/* 需求留言板：买家可编辑，卖家只读 */}
      {(isBuyer || isSeller) && order.status !== "pending" ? (
        <div className="mt-8">
          <RequirementBox orderId={order.id} initialRequirements={requirements} disabled={!isBuyer} />
        </div>
      ) : null}

      {/* 交付成果展示区域：有交付记录则展示给双方 */}
      {order.deliveries && order.deliveries.length > 0 ? (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-500" />
            交付成果
          </h2>
          {order.deliveries.map((delivery: any) => (
            <div key={delivery.id} className="bg-[#151F32] border border-white/10 rounded-2xl p-6 shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-slate-400 whitespace-pre-wrap">{delivery.content}</div>
                <div className="text-xs text-slate-500">{new Date(delivery.createdAt).toLocaleString()}</div>
              </div>

              {delivery.fileKey ? (
                <div className="flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                      <Archive className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
                        {delivery.fileName || "交付文件"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {delivery.fileSize ? (delivery.fileSize / 1024 / 1024).toFixed(2) : "0"} MB
                      </div>
                    </div>
                  </div>
                  <DownloadButtonClient deliveryId={delivery.id} />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {/* 买家验收入口：DELIVERED 状态下展示 */}
      {isBuyer && order.status === "delivered" ? (
        <AcceptanceButton orderId={order.id} />
      ) : null}

      {/* 卖家视角：已交付则隐藏交付表单，避免误操作 */}
      {isSeller && order.status === "delivered" ? (
        <div className="mt-8 bg-slate-900/30 border border-white/10 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-2 text-slate-200 font-bold">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            已交付，等待买家验收中...
          </div>
          <div className="mt-2 text-sm text-slate-400">
            买家确认验收后，订单将流转为“交易完成”，托管资金释放给卖家。
          </div>
        </div>
      ) : showSellerDeliveryForm ? (
        <div className="mt-8">
          <DeliveryForm orderId={order.id} />
        </div>
      ) : null}
    </div>
  );
}
