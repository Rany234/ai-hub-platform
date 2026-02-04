import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard");
  }

  const navItems = [
    { key: "overview", label: "📊 概览", href: "/dashboard" },
    { key: "listings", label: "🛍️ 我发布的服务", href: "/dashboard/listings" },
    { key: "jobs", label: "📢 我发布的任务", href: "/dashboard/jobs" },
    { key: "sales", label: "💰 销售与订单", href: "/dashboard/sales" },
    { key: "settings", label: "⚙️ 账号设置", href: "/dashboard/settings" },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-muted/10">
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm hover:bg-muted/40 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
