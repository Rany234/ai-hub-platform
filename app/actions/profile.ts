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
