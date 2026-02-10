import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { OrderStepper } from "@/features/orders/components/OrderStepper";
import { PayButtonClient } from "@/features/orders/components/PayButtonClient";
import { StatusBadge } from "@/components/StatusBadge";
import { DeliveryPanelClient } from "./DeliveryPanelClient";
import { LeaveReviewClient } from "./LeaveReviewClient";

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
  const { id } = await params;
  const sp = await searchParams;

  const success = sp.success === "true";
  const canceled = sp.canceled === "true";

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectedFrom=/dashboard/orders/${encodeURIComponent(id)}`);
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select("id, buyer_id, listing_id, amount, status, escrow_status, created_at, metadata")
    .eq("id", id)
    .single();

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">订单</h1>
        <p className="mt-4 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("id, title, preview_url, price, creator_id")
    .eq("id", order.listing_id)
    .single();

  const { data: deliveries } = await supabase
    .from("deliveries")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle();

  const userId = user.id;
  const isBuyer = order.buyer_id === userId;
  const isSeller = listing?.creator_id === userId;

  const metadata =
    order.metadata && typeof order.metadata === "object"
      ? (order.metadata as Record<string, unknown>)
      : null;

  const requirements =
    metadata && "requirements" in metadata ? String(metadata.requirements ?? "") : "";
  const lastFeedback =
    metadata && "last_feedback" in metadata ? String(metadata.last_feedback ?? "") : undefined;

  const showBuyerPay = isBuyer && order.status === "pending";

  const showLeaveReview =
    isBuyer &&
    order.status === "completed" &&
    !existingReview?.id;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {success ? (
        <div className="mb-4 rounded-md border border-green-900/50 bg-green-900/20 px-4 py-3 text-sm text-green-400">
          支付成功！资金已安全托管，请等待卖家交付。
        </div>
      ) : null}

      {canceled ? (
        <div className="mb-4 rounded-md border border-yellow-900/50 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-400">
          支付已取消。
        </div>
      ) : null}

      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">订单</h1>
        <a
          className="text-sm underline text-slate-400 hover:text-white transition-colors"
          href={`/listings/${encodeURIComponent(order.listing_id)}`}
        >
          查看服务
        </a>
      </div>

      <div className="mt-6">
        <OrderStepper currentStatus={order.status} />
      </div>

      <div className="mt-6 border border-brand-border bg-brand-surface rounded-xl p-6 shadow-xl">
        {requirements ? (
          <div className="bg-black/20 p-4 rounded-lg border border-brand-border mb-6">
            <div className="text-sm font-bold text-slate-200">需求描述 (Project Brief)</div>
            <div className="mt-2 whitespace-pre-wrap text-sm text-slate-400">
              {requirements}
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">订单号</div>
            <div className="mt-1 font-mono text-slate-300">{order.id}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">当前状态</div>
              <div className="mt-1">
                <StatusBadge status={order.status} />
              </div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">资金状态</div>
              <div className="mt-1 font-mono text-slate-300">{formatFundStatus(order.status)}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">服务</div>
            <div className="mt-1 text-slate-200 font-semibold">{listing?.title ?? order.listing_id}</div>
          </div>

          <div className="pt-4 border-t border-brand-border flex items-baseline justify-between">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">合计</div>
            <div className="text-2xl font-bold text-brand-action">¥{order.amount}</div>
          </div>
        </div>

        {showBuyerPay ? (
          <div className="mt-6">
            <PayButtonClient orderId={order.id} />
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <DeliveryPanelClient
          orderId={order.id}
          deliveries={deliveries ?? []}
          isBuyer={isBuyer}
          isSeller={isSeller}
          orderStatus={order.status}
          lastFeedback={lastFeedback}
        />
      </div>

      {showLeaveReview ? (
        <div className="mt-6">
          <LeaveReviewClient orderId={order.id} />
        </div>
      ) : null}

      {isBuyer && isSeller ? (
        <div className="mt-6 border-t pt-6 text-sm text-muted-foreground">
          你当前同时是该订单的买家与卖家（测试模式），相关操作已同时开放。
        </div>
      ) : null}

      {!isBuyer && !isSeller ? (
        <p className="mt-6 text-sm text-muted-foreground">你无权操作该订单。</p>
      ) : null}
    </div>
  );
}
