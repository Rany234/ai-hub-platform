"use server";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function ensureConversationExists({
  buyerId,
  sellerId,
  orderId,
}: {
  buyerId: string;
  sellerId: string;
  orderId?: string | null;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("id")
    .eq("buyer_id", buyerId)
    .eq("seller_id", sellerId)
    .eq("order_id", orderId ?? null)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    return data.id;
  }

  const { data: created, error: createError } = await supabase
    .from("conversations")
    .insert({
      buyer_id: buyerId,
      seller_id: sellerId,
      order_id: orderId,
    })
    .select("id")
    .single();

  if (createError) throw createError;

  return created.id;
}