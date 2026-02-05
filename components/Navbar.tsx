import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { UserDropdown } from "./UserDropdown";

export async function Navbar() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => data)
    : null;

  return (
    <header className="border-b">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">
            智汇 AI-Hub
          </Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link className="underline-offset-4 hover:underline" href="/">
              市场
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard/jobs">
              任务大厅
            </Link>
            <Link className="underline-offset-4 hover:underline" href="/dashboard">
              控制台
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {!user ? (
            <>
              <Link className="rounded-md border px-3 py-1.5" href="/login">
                登录
              </Link>
              <Link className="rounded-md bg-black text-white px-3 py-1.5" href="/signup">
                注册
              </Link>
            </>
          ) : (
            <>
              <Link
                className="rounded-md bg-black text-white px-3 py-1.5"
                href="/dashboard/listings/new"
              >
                成为卖家 / 发布服务
              </Link>
              <UserDropdown
                avatarUrl={profile?.avatar_url}
                fullName={profile?.full_name}
                username={profile?.username}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}