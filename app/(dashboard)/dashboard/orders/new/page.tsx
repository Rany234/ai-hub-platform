import { redirect } from "next/navigation";

import { createOrderAction } from "@/features/orders/actions";

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const listingId = typeof sp.listingId === "string" ? sp.listingId : undefined;

  if (!listingId) {
    redirect("/?error=" + encodeURIComponent("缺少 listingId"));
  }

  // Backward-compatible path: if user lands here, create an order with a default brief.
  const result = await createOrderAction(listingId, "（未填写需求描述）");

  if (!result.success) {
    if (result.code === "UNAUTHORIZED") {
      redirect("/login?redirectedFrom=/dashboard/orders/new");
    }

    redirect(`/listings/${encodeURIComponent(listingId)}?error=${encodeURIComponent(result.error)}`);
  }

  redirect(`/dashboard/orders/${encodeURIComponent(result.orderId)}`);
}
