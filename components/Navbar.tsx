import Link from "next/link";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { UserDropdown } from "./UserDropdown";
import { NavLinks } from "./NavLinks";

export async function Navbar() {
  const session = await auth();
  const user = session?.user;

  const profile = user?.id
    ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          username: true,
          fullName: true,
          avatarUrl: true,
        },
      })
    : null;

  // TODO: Replace with real wallet balance query once wallet tables are stable.
  const balance = "¥1,200.00";

  // TODO: Replace with real unread message count once chat/message tables are stable.
  const unreadMessages = 5;

  return (
    <header className="sticky top-0 z-50 border-b bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-white">
            智汇 AI-Hub
          </Link>
          <NavLinks />
        </div>

        <div className="flex items-center gap-3 text-sm">
          {!user ? (
            <>
              <Link
                className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 font-bold text-slate-100 hover:bg-white/10 transition-colors"
                href="/login"
              >
                登录
              </Link>
              <Link
                className="rounded-md bg-brand-action/90 hover:bg-brand-action text-slate-950 px-3 py-1.5 font-black transition-colors"
                href="/signup"
              >
                注册
              </Link>
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/dashboard/wallet"
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-extrabold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  余额 {balance}
                </Link>
                <Link
                  href="/dashboard/chat"
                  className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 font-extrabold text-slate-200 hover:bg-white/10 transition-colors"
                >
                  消息 {unreadMessages}
                </Link>
              </div>

              <Link
                className="rounded-md bg-brand-action/15 text-brand-action px-3 py-1.5 font-black hover:bg-brand-action/20 transition-colors"
                href="/dashboard"
              >
                控制台
              </Link>

              <Link
                className="rounded-md bg-black text-white px-3 py-1.5 font-bold hover:bg-black/80 transition-colors"
                href="/dashboard/listings/new"
              >
                发布服务 / 资产
              </Link>
              <UserDropdown
                avatarUrl={profile?.avatarUrl}
                fullName={profile?.fullName}
                username={profile?.username}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
