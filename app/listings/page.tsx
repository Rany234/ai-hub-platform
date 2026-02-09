import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { ListingCard, type Listing } from "@/features/listings/components/ListingCard";

type SearchParams = {
  q?: string;
  query?: string;
};

function getSearchTerm(searchParams: SearchParams | undefined) {
  const raw = searchParams?.query ?? searchParams?.q;
  return typeof raw === "string" ? raw.trim() : "";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const term = getSearchTerm(resolved);

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (term) {
    const escaped = term.replaceAll(",", " ").replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl border bg-white p-6">
          <h1 className="font-jakarta text-2xl font-extrabold text-slate-900">探索 AI 服务</h1>
          <p className="mt-3 text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }

  const listings = (data ?? []) as Listing[];
  const total = typeof count === "number" ? count : listings.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-jakarta text-3xl font-extrabold tracking-tight text-slate-900">探索 AI 服务</h1>
        <p className="mt-2 text-sm text-slate-600">
          浏览最新上架的 AI 服务与创作者套餐，找到适合你的解决方案。
        </p>
        {term ? (
          <p className="mt-4 text-sm text-slate-700">
            找到 <span className="font-semibold text-indigo-600">{total}</span> 个关于“
            <span className="font-semibold">{term}</span>”的结果
          </p>
        ) : null}
      </header>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border bg-white px-6 py-16 text-center">
          <div className="font-jakarta text-xl font-extrabold text-slate-900">没有找到相关服务</div>
          <div className="mt-2 text-sm text-slate-600">换个关键词试试？</div>
          <Link
            href="/listings"
            className="mt-6 inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            清除搜索
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
