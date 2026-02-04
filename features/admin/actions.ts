"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

async function assertAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const adminId = process.env.ADMIN_USER_ID;
  if (!adminId || user.id !== adminId) throw new Error("Forbidden");

  return { supabase, user };
}

export async function setListingModerationStatusAction(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<null>> {
  try {
    const listingId = formData.get("listingId");
    const status = formData.get("status") as string | null;
    if (!listingId || (status !== "active" && status !== "banned")) {
      return { success: false, error: "Invalid parameters" };
    }

    const { supabase } = await assertAdmin();

    const { error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", listingId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin");
    revalidatePath(`/listings/${listingId}`);

    return { success: true, data: null };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
