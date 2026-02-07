"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function createService(data: {
  title: string;
  description?: string | null;
  price: number;
  delivery_days: number;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };

    if (!data.title?.trim()) return { success: false, error: "Title is required" };

    const priceNum = Number(data.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return { success: false, error: "Invalid price" };
    }

    const daysNum = Number(data.delivery_days);
    if (!Number.isFinite(daysNum) || daysNum <= 0) {
      return { success: false, error: "Invalid delivery days" };
    }

    const { error } = await supabase.from("services").insert({
      worker_id: user.id,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      price: priceNum,
      delivery_days: daysNum,
    } as any);

    if (error) return { success: false, error: error.message };

    revalidatePath(`/dashboard/profile/${user.id}`);
    revalidatePath(`/dashboard/profile/me`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
}

export async function getWorkerServices(userId: string): Promise<
  { id: string; worker_id: string; title: string; description: string | null; price: string | number; delivery_days: number; created_at: string }[]
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("services")
    .select("id,worker_id,title,description,price,delivery_days,created_at")
    .eq("worker_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as any) ?? [];
}
