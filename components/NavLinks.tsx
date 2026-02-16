"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/listings", label: "服务市场" },
    { href: "/dashboard/jobs", label: "悬赏大厅" },
    { href: "/manifesto", label: "创作者宣言" },
  ];

  return (
    <nav className="flex items-center gap-6 text-sm font-semibold">
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "transition-colors hover:text-white underline-offset-4 hover:underline",
              isActive ? "text-brand-action font-extrabold" : "text-slate-400"
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
