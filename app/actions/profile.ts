"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}