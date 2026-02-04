"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { logoutAction } from "@/features/auth/actions";

type Props = {
  avatarUrl?: string | null;
  fullName?: string | null;
  username?: string | null;
};

export function UserDropdown({ avatarUrl, fullName, username }: Props) {
  const supabase = createSupabaseBrowserClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayName = fullName || username || "用户";

  async function handleLogout(e: React.FormEvent) {
    e.preventDefault();
    const result = await logoutAction();
    if (result.success) {
      window.location.href = "/";
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="h-9 w-9 rounded-full border overflow-hidden bg-white flex items-center justify-center text-xs text-muted-foreground hover:border-gray-400"
        onClick={() => setOpen((v) => !v)}
        aria-label="用户菜单"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt="avatar" src={avatarUrl} className="h-full w-full object-cover" />
        ) : (
          "无"
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-white p-1 shadow-lg z-50">
            <div className="px-3 py-2 text-sm font-medium border-b">
              {displayName}
            </div>

            <Link
              className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
            >
              👤 个人资料
            </Link>

            <Link
              className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
              href="/dashboard/orders"
              onClick={() => setOpen(false)}
            >
              📦 我买到的
            </Link>

            <Link
              className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
              href="/dashboard/sales"
              onClick={() => setOpen(false)}
            >
              💰 我卖出的
            </Link>

            <Link
              className="block px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
              href="/dashboard/listings"
              onClick={() => setOpen(false)}
            >
              📂 管理我的服务
            </Link>

            <div className="border-t my-1" />

            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded-md"
              >
                退出登录
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
