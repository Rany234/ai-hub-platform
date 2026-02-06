"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function getWallet() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: wallet, error } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!wallet) {
    const { data: newWallet, error: createError } = await supabase
      .from("wallets")
      .insert({ user_id: user.id, balance: 0, frozen_amount: 0 })
      .select("*")
      .single();

    if (createError) throw new Error(createError.message);
    return newWallet;
  }

  return wallet;
}

export async function getTransactions() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!wallet) return [];

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return transactions || [];
}

export async function mockDeposit(amount: number) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const wallet = await getWallet();

  // 1. Update wallet balance
  const { error: updateError } = await supabase
    .from("wallets")
    .update({ balance: Number(wallet.balance) + amount })
    .eq("id", wallet.id);

  if (updateError) throw new Error(updateError.message);

  // 2. Create transaction record
  const { error: transError } = await supabase
    .from("transactions")
    .insert({
      wallet_id: wallet.id,
      amount,
      type: "deposit",
      description: "模拟充值",
    });

  if (transError) throw new Error(transError.message);

  revalidatePath("/dashboard/wallet");
  return { success: true };
}
