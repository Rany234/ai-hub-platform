"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export type UserRole = "client" | "freelancer";

export async function updateUserRole(role: UserRole) {
  if (role !== "client" && role !== "freelancer") {
    throw new Error("Invalid role");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role,
    })
    .select();

  if (error) {
    console.error("Update role failed:", error);
    throw new Error("Failed to update role");
  }

  revalidatePath("/dashboard", "layout");
  return { success: true } as const;
}

export async function updateProfile(formData: FormData): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const full_name = formData.get("full_name") as string | null;
    const bio = formData.get("bio") as string | null;
    const email = formData.get("email") as string | null;
    const wechat_id = formData.get("wechat_id") as string | null;
    const avatar_url = formData.get("avatar_url") as string | null;

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        full_name: full_name?.trim() || null,
        bio: bio?.trim() || null,
        email: email?.trim() || null,
        wechat_id: wechat_id?.trim() || null,
        avatar_url: avatar_url?.trim() || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
}
