import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { SettingsFormClient } from "./settings-form-client";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, full_name, bio, website, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold">用户设置</h1>
      <p className="mt-2 text-sm text-muted-foreground">更新你的个人资料与头像。</p>

      <div className="mt-6">
        <SettingsFormClient
          userId={user.id}
          initialProfile={profile ?? null}
        />
      </div>
    </div>
  );
}
