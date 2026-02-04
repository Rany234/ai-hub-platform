import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { StatusBadge } from "@/components/StatusBadge";
import { ListingCard } from "@/features/listings/components/ListingCard";

export default async function OrdersPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/orders");
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*, listings!inner(*)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">我的订单</h1>
        <p className="mt-4 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const pendingReviewCount = orders?.filter((o) => o.status === "delivered").length ?? 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">我的订单</h1>

      {pendingReviewCount > 0 ? (
        <div className="mt-4 rounded-md border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800">
          你有 <span className="font-semibold">{pendingReviewCount}</span> 个订单待验收，请尽快确认。
        </div>
      ) : null}

      {!orders || orders.length === 0 ? (
        <div className="mt-10 flex items-center justify-center">
          <div className="w-full max-w-md border rounded-xl p-6 text-center">
            <h2 className="text-lg font-semibold">还没有订单</h2>
            <p className="mt-2 text-sm text-muted-foreground">去市场看看有什么服务吧。</p>
            <a
              href="/"
              className="inline-flex mt-4 items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm"
            >
              浏览市场
            </a>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const listing = order.listings;

            return (
              <a
                key={order.id}
                href={`/dashboard/orders/${encodeURIComponent(order.id)}`}
                className="block border rounded-lg p-4 hover:border-gray-400 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold leading-tight line-clamp-2">{listing.title}</h3>
                  <div className="text-sm font-medium whitespace-nowrap">¥{order.amount}</div>
                </div>

                {listing.preview_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt={listing.title}
                    src={listing.preview_url}
                    className="mt-3 w-full h-32 object-cover rounded-md border"
                  />
                ) : null}

                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={order.status} />
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
