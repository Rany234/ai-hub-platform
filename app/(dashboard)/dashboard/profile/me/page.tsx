import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function MyProfileRedirectPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/profile/me");
  }

  redirect(`/dashboard/profile/${user.id}`);
}
