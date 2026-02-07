"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { createListingSchema } from "./schemas";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function mapDbErrorToChinese(message: string): string {
  const m = message.toLowerCase();

  if (m.includes("foreign key") || m.includes("23503")) {
    return "用户档案缺失，请联系管理员或尝试重新登录";
  }

  return "发布失败，请稍后重试";
}

export async function createListing(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const rawPackages = formData.get("packages");
    const parsedPackages =
      typeof rawPackages === "string" && rawPackages.length > 0
        ? JSON.parse(rawPackages)
        : undefined;

    const input = createListingSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      category: formData.get("category") || undefined,
      previewUrl: formData.get("previewUrl") || undefined,
      packages: parsedPackages,
    });

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: "发布失败，请稍后重试" };
    if (!user) return { success: false, error: "未登录" };

    try {
      const { data, error } = await supabase
        .from("listings")
        .insert({
          creator_id: user.id,
          title: input.title,
          description: input.description ?? null,
          packages: input.packages,
          category: input.category ?? null,
          preview_url: input.previewUrl ?? null,
          status: "active",
        })
        .select("id")
        .single();

      if (error) return { success: false, error: mapDbErrorToChinese(error.message) };

      revalidatePath("/");
      revalidatePath("/dashboard");

      return { success: true, data: { id: data.id } };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      return { success: false, error: mapDbErrorToChinese(msg) };
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "发布失败，请稍后重试",
    };
  }
}

export async function updateListing(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<null>> {
  try {
    const rawPackages = formData.get("packages");
    const parsedPackages =
      typeof rawPackages === "string" && rawPackages.length > 0
        ? JSON.parse(rawPackages)
        : undefined;

    const input = createListingSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      category: formData.get("category") || undefined,
      previewUrl: formData.get("previewUrl") || undefined,
      packages: parsedPackages,
    });

    const id = formData.get("id");
    if (typeof id !== "string" || id.length === 0) {
      return { success: false, error: "无效的服务 ID" };
    }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: "更新失败，请稍后重试" };
    if (!user) return { success: false, error: "未登录" };

    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: input.title,
          description: input.description ?? null,
          packages: input.packages,
          category: input.category ?? null,
          preview_url: input.previewUrl ?? null,
        })
        .eq("id", id)
        .eq("creator_id", user.id); // RLS guard

      if (error) return { success: false, error: mapDbErrorToChinese(error.message) };

      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath(`/listings/${id}`);

      return { success: true, data: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      return { success: false, error: mapDbErrorToChinese(msg) };
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "更新失败，请稍后重试",
    };
  }
}