"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

type CreateOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "NOT_FOUND" | "UNKNOWN" };

export async function createOrderAction(
  listingId: string,
  requirements: string,
  selectedOptions: Array<{ label: string; price: number }> = []
): Promise<CreateOrderResult> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "请先登录后再下单", code: "UNAUTHORIZED" };
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, price, options")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return { success: false, error: "服务不存在或已下架", code: "NOT_FOUND" };
    }

    const serverOptions = (listing.options as Array<{ label: string; price: number }> | null) ?? [];

    const validated = selectedOptions.filter((so) => {
      const match = serverOptions.find((o) => o.label === so.label && o.price === so.price);
      return Boolean(match);
    });

    const addOnTotal = validated.reduce((acc, o) => acc + o.price, 0);
    const total = listing.price + addOnTotal;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        buyer_id: user.id,
        listing_id: listing.id,
        amount: total,
        status: "pending",
        escrow_status: "held",
        metadata: {
          requirements,
          selected_options: validated,
        },
      })
      .select("id")
      .single();

    if (orderError || !order) {
      return { success: false, error: "下单失败，请稍后重试", code: "UNKNOWN" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true, orderId: order.id };
  } catch {
    return { success: false, error: "下单失败，请稍后重试", code: "UNKNOWN" };
  }
}

export async function payOrderAction(orderId: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    const { error } = await supabase
      .from("orders")
      .update({
        status: "paid",
        escrow_status: "held",
      })
      .eq("id", orderId)
      .eq("buyer_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "支付失败",
    };
  }
}

export async function createDeliveryAction(
  orderId: string,
  content: string,
  fileUrl?: string
): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, listing_id, status")
      .eq("id", orderId)
      .single();

    if (orderError) return { success: false, error: orderError.message };

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, creator_id")
      .eq("id", order.listing_id)
      .single();

    if (listingError) return { success: false, error: listingError.message };

    if (listing.creator_id !== user.id) {
      return { success: false, error: "无权限" };
    }

    if (!["paid", "delivered"].includes(order.status)) {
      return { success: false, error: "订单状态不正确，无法交付" };
    }

    const { error: insertError } = await supabase
      .from("deliveries")
      .insert({
        order_id: orderId,
        content,
        file_url: fileUrl ?? null,
      });

    if (insertError) return { success: false, error: insertError.message };

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "delivered",
      })
      .eq("id", orderId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "提交交付失败",
    };
  }
}

export async function approveDeliveryAction(orderId: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, status")
      .eq("id", orderId)
      .single();

    if (orderError) return { success: false, error: orderError.message };

    if (order.buyer_id !== user.id) {
      return { success: false, error: "无权限" };
    }

    if (order.status !== "delivered") {
      return { success: false, error: "订单状态不正确，无法确认收货" };
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "completed",
        escrow_status: "released",
      })
      .eq("id", orderId)
      .eq("buyer_id", user.id);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "确认收货失败",
    };
  }
}

export async function requestChangesAction(orderId: string, feedback: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, status, metadata")
      .eq("id", orderId)
      .single();

    if (orderError) return { success: false, error: orderError.message };

    if (order.buyer_id !== user.id) {
      return { success: false, error: "无权限" };
    }

    if (order.status !== "delivered") {
      return { success: false, error: "订单状态不正确，无法申请修改" };
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        metadata: {
          ...(order.metadata ?? {}),
          last_feedback: feedback,
          requested_changes_at: new Date().toISOString(),
        },
      })
      .eq("id", orderId)
      .eq("buyer_id", user.id);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "申请修改失败",
    };
  }
}
