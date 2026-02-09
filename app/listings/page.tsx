import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { ListingCard, type Listing } from "@/features/listings/components/ListingCard";

import type { Metadata } from "next";

type SearchParams = {
  q?: string;
  query?: string;
  category?: string;
  sort?: string;
};

export const metadata: Metadata = {
  title: "浏览 AI 服务 - 智汇 AI-Hub",
};

function getStringParam(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function getSearchTerm(searchParams: SearchParams | undefined) {
  return getStringParam(searchParams?.q ?? searchParams?.query);
}

function getCategory(searchParams: SearchParams | undefined) {
  return getStringParam(searchParams?.category);
}

function getSort(searchParams: SearchParams | undefined) {
  const raw = getStringParam(searchParams?.sort);
  return raw || "new";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const term = getSearchTerm(resolved);
  const category = getCategory(resolved);
  const sort = getSort(resolved);

  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active");

  if (category) {
    query = query.eq("category", category);
  }

  if (term) {
    const escaped = term.replaceAll(",", " ").replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(`title.ilike.%${escaped}%,description.ilike.%${escaped}%`);
  }

  if (sort === "price_asc") {
    query = query.order("price", { ascending: true }).order("created_at", { ascending: false });
  } else if (sort === "price_desc") {
    query = query.order("price", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
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

  const categoryLabelMap: Record<string, string> = {
    prompt: "定制提示词",
    workflow: "工作流搭建",
    image_set: "图集定制",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="font-jakarta text-3xl font-extrabold tracking-tight text-slate-900">服务市场</h1>
        <p className="mt-2 text-sm text-slate-600">
          发现、购买与定制顶尖的 AI 服务与解决方案。
        </p>
        
        <div className="mt-4 text-sm text-indigo-600 font-medium">
          {term || category ? (
            <span>
              找到 {total} 个关于
              {term ? `“${term}”` : ""}
              {category ? ` · 分类：${categoryLabelMap[category] || category}` : ""}
              的结果
            </span>
          ) : (
            <span>共 {total} 个上架服务</span>
          )}
        </div>
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
