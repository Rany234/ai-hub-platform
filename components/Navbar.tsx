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

  return (
    <header className="sticky top-0 z-50 border-b bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold text-white">
            智汇 AI-Hub
          </Link>
          <NavLinks />
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