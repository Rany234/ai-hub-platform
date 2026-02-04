import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { AdminListingRow } from "./AdminListingRow";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { data: gmvRows } = await supabase.from("orders").select("amount");
  const totalGmv = (gmvRows ?? []).reduce((acc, row: any) => acc + Number(row.amount ?? 0), 0);

  const { data: pendingListings } = await supabase
    .from("listings")
    .select("id, title, price, status, created_at")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: latestListings } = await supabase
    .from("listings")
    .select(
      "id, title, price, status, created_at, preview_url, creator_id, profiles(id, username, full_name, avatar_url)"
    )
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <Link href="/" className="text-sm underline text-muted-foreground">
          返回前台
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">总用户数</div>
          <div className="mt-1 text-2xl font-semibold">{totalUsers ?? 0}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">总交易额 (GMV)</div>
          <div className="mt-1 text-2xl font-semibold">¥{totalGmv.toFixed(2)}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">待审核服务（最新 5 条 active）</div>
          <div className="mt-2 grid gap-1">
            {pendingListings && pendingListings.length > 0 ? (
              pendingListings.map((l) => (
                <div key={l.id} className="text-sm truncate">
                  {l.title}
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground">暂无</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold">最新发布的服务 (Latest Listings)</h2>

        <div className="mt-4 overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="p-3">封面</th>
                <th className="p-3">标题</th>
                <th className="p-3">作者</th>
                <th className="p-3">价格</th>
                <th className="p-3">状态</th>
                <th className="p-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {latestListings && latestListings.length > 0 ? (
                latestListings.map((listing: any) => (
                  <AdminListingRow key={listing.id} listing={listing} />
                ))
              ) : (
                <tr>
                  <td className="p-6 text-muted-foreground" colSpan={6}>
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
