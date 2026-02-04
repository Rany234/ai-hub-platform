"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

export async function createReviewAction(
  input: {
    orderId: string;
    rating: number;
    content: string;
  }
): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    if (!Number.isFinite(input.rating) || input.rating < 1 || input.rating > 5) {
      return { success: false, error: "评分必须为 1-5" };
    }

    const content = input.content.trim();
    if (content.length === 0) {
      return { success: false, error: "请填写评价内容" };
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, buyer_id, listing_id, status")
      .eq("id", input.orderId)
      .single();

    if (orderError) return { success: false, error: orderError.message };

    if (order.buyer_id !== user.id) {
      return { success: false, error: "无权限" };
    }

    if (order.status !== "completed") {
      return { success: false, error: "订单未完成，无法评价" };
    }

    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("order_id", input.orderId)
      .maybeSingle();

    if (existing?.id) {
      return { success: false, error: "你已提交过该订单的评价" };
    }

    const { error: insertError } = await supabase.from("reviews").insert({
      order_id: input.orderId,
      listing_id: order.listing_id,
      reviewer_id: user.id,
      rating: input.rating,
      content,
    });

    if (insertError) return { success: false, error: insertError.message };

    revalidatePath(`/dashboard/orders/${input.orderId}`);
    revalidatePath(`/listings/${order.listing_id}`);

    return { success: true, data: null };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "提交评价失败",
    };
  }
}
