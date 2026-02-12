"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { createListingSchema } from "./schemas";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };


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

    let input;
    try {
      input = createListingSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      category: formData.get("mainCategory") || undefined,
      previewUrl: formData.get("previewUrl") || undefined,
      packages: parsedPackages,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: e.errors[0].message };
    }
    throw e;
  }

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    // --- 共生门禁：后端硬校验 ---
    const { data: signature } = await supabase
      .from("manifesto_signatures")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!signature) {
      return { success: false, error: "Unauthorized: Please sign the manifesto first." };
    }
    // -------------------------

    try {
      const { data, error } = await supabase
        .from("listings")
        .insert({
          creator_id: user.id,
          title: input.title,
          description: input.description ?? null,
          packages: input.packages,
          category: input.category ?? null,
          metadata: {
            sub_category: typeof formData.get("subCategory") === "string" ? formData.get("subCategory") : null,
          },
          preview_url: input.previewUrl ?? null,
          status: "active",
        })
        .select("id")
        .single();

      if (error) return { success: false, error: error.message };

      revalidatePath("/");
      revalidatePath("/dashboard");

      return { success: true, data: { id: data.id } };
    } catch (e) {
      console.error("SERVER_ACTION_ERROR:", e);
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  } catch (e) {
    console.error("SERVER_ACTION_ERROR:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
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
      category: formData.get("mainCategory") || undefined,
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

    if (userError) return { success: false, error: userError.message };
    if (!user) return { success: false, error: "未登录" };

    // --- 共生门禁：后端硬校验 ---
    const { data: signature } = await supabase
      .from("manifesto_signatures")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!signature) {
      return { success: false, error: "Unauthorized: Please sign the manifesto first." };
    }
    // -------------------------

    try {
      const nextSubCategory = formData.get("subCategory");
      const subCategory = typeof nextSubCategory === "string" ? nextSubCategory : null;

      const { data: currentListing, error: fetchError } = await supabase
        .from("listings")
        .select("metadata")
        .eq("id", id)
        .eq("creator_id", user.id)
        .maybeSingle();

      if (fetchError) return { success: false, error: fetchError.message };

      const existingMetadata =
        currentListing && typeof currentListing.metadata === "object" && currentListing.metadata !== null
          ? (currentListing.metadata as Record<string, unknown>)
          : {};

      const mergedMetadata = { ...existingMetadata, sub_category: subCategory };

      const { error } = await supabase
        .from("listings")
        .update({
          title: input.title,
          description: input.description ?? null,
          packages: input.packages,
          category: input.category ?? null,
          metadata: mergedMetadata,
          preview_url: input.previewUrl ?? null,
        })
        .eq("id", id)
        .eq("creator_id", user.id); // RLS guard

      if (error) return { success: false, error: error.message };

      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath(`/listings/${id}`);

      return { success: true, data: null };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function deleteListing(id: string): Promise<ActionResult<null>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) return { success: false, error: "未登录或权限不足" };

    const { error } = await supabase
      .from("listings")
      .delete()
      .eq("id", id)
      .eq("creator_id", user.id);

    if (error) return { success: false, error: "删除失败，请稍后重试" };

    revalidatePath("/dashboard/services");
    revalidatePath("/");

    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: "删除操作发生异常" };
  }
}