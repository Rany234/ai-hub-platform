"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { logoutAction } from "@/features/auth/actions";

type Props = {
  avatarUrl?: string | null;
  fullName?: string | null;
  username?: string | null;
};

export function UserDropdown({ avatarUrl, fullName, username }: Props) {
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
        className="h-9 w-9 rounded-full border border-white/10 overflow-hidden bg-slate-800 flex items-center justify-center text-xs text-slate-300 hover:border-brand-action/60 transition-colors"
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
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-brand-border bg-brand-surface p-1 shadow-2xl z-50">
            <div className="px-3 py-2 text-sm font-medium border-b border-brand-border text-slate-100">
              {displayName}
            </div>

            <Link
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
            >
              👤 个人资料
            </Link>

            <Link
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
              href="/dashboard/chat"
              onClick={() => setOpen(false)}
            >
              💬 消息中心
            </Link>

            <Link
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
              href="/dashboard/wallet"
              onClick={() => setOpen(false)}
              title="⌘B"
            >
              💰 我的钱包
            </Link>

            <Link
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
              href="/dashboard/orders"
              onClick={() => setOpen(false)}
            >
              📦 我买到的
            </Link>

            <Link
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
              href="/dashboard/sales"
              onClick={() => setOpen(false)}
            >
              💰 我卖出的
            </Link>

            <Link
              className="block px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
              href="/dashboard/listings"
              onClick={() => setOpen(false)}
            >
              📂 管理我的服务
            </Link>

            <div className="border-t my-1" />

            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-white/5 rounded-md transition-colors"
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
