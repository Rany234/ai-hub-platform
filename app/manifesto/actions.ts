"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export async function signManifesto(signatureHash: string) {
  const supabase = createSupabaseBrowserClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("请先登录再签署宣言");
  }

  const { data, error } = await supabase
    .from("manifesto_signatures")
    .insert({
      user_id: user.id,
      signature_hash: signatureHash,
      signed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") { // Unique constraint violation
      throw new Error("您已经签署过该宣言了");
    }
    throw new Error(error.message);
  }

  return data;
}

export async function getSignatureStatus() {
  const supabase = createSupabaseBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { signed: false };

  const { data, error } = await supabase
    .from("manifesto_signatures")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return { signed: false };
  return { signed: !!data };
}

export async function getSignatureCount() {
  const supabase = createSupabaseBrowserClient();
  const { count, error } = await supabase
    .from("manifesto_signatures")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}
