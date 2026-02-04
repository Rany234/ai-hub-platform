import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const ADMIN_USER_ID = process.env.ADMIN_USER_ID;
  if (!ADMIN_USER_ID || user.id !== ADMIN_USER_ID) {
    redirect("/");
  }

  return <div className="min-h-screen">{children}</div>;
}
