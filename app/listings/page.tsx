import Link from "next/link";
import prisma from "@/lib/prisma";
import { ListingCard } from "@/features/listings/components/ListingCard";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";

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

export default async function ListingsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const term = getStringParam(resolved?.q ?? resolved?.query);
  const category = getStringParam(resolved?.category);
  const sort = getStringParam(resolved?.sort) || "new";

  // 构建 Prisma 查询条件
  const where: Prisma.ListingWhereInput = {
    status: "active",
  };

  if (category) {
    if (category === "assets") {
      where.category = { in: ["prompt", "image_set"] };
    } else if (category === "services") {
      where.category = "workflow";
    } else if (category === "solutions") {
      where.category = "enterprise_solution";
    } else {
      where.category = category;
    }
  }

  if (term) {
    where.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  // 构建排序条件
  let orderBy: Prisma.ListingOrderByWithRelationInput | Prisma.ListingOrderByWithRelationInput[] = {
    createdAt: "desc",
  };

  if (sort === "price_asc") {
    orderBy = [{ price: "asc" }, { createdAt: "desc" }];
  } else if (sort === "price_desc") {
    orderBy = [{ price: "desc" }, { createdAt: "desc" }];
  }

  try {
    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        take: 50,
      }),
      prisma.listing.count({ where }),
    ]);

    const categoryLabelMap: Record<string, string> = {
      assets: "AI 数字资产",
      services: "定制化服务",
      solutions: "企业级方案",
      prompt: "定制提示词",
      workflow: "工作流搭建",
      image_set: "图集定制",
    };

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">服务市场</h1>
            <p className="mt-2 text-sm text-slate-400">
              发现、购买与定制顶尖的 AI 服务与解决方案。
            </p>

            <div className="mt-3 text-sm font-medium text-slate-400">
              {term || category ? (
                <span>
                  找到 <span className="text-brand-action font-bold">{total}</span> 个关于
                  {term ? <span className="text-slate-200">“{term}”</span> : null}
                  {category ? (
                    <span>
                      {" "}· 分类：
                      <span className="text-brand-action">{categoryLabelMap[category] || category}</span>
                    </span>
                  ) : null}
                  的结果
                </span>
              ) : (
                <span>
                  共 <span className="text-brand-action font-bold">{total}</span> 个上架服务
                </span>
              )}
            </div>
          </div>

          <form action="/listings" className="rounded-2xl border border-[#334155] bg-[#151F32] p-4 shadow-xl">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_220px_120px] md:items-center">
              <input
                name="q"
                defaultValue={term}
                placeholder="搜索 Prompt、模型部署、定制开发..."
                className="h-11 w-full rounded-xl bg-[#0B1121] border border-[#334155] px-4 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50"
              />

              <select
                name="category"
                defaultValue={category}
                className="h-11 w-full rounded-xl bg-[#0B1121] border border-[#334155] px-4 text-slate-100 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50"
              >
                <option value="">全部分类</option>
                <option value="assets">AI 数字资产</option>
                <option value="services">定制化服务</option>
                <option value="solutions">企业级解决方案</option>
                <option value="prompt">定制提示词（旧）</option>
                <option value="workflow">工作流搭建（旧）</option>
                <option value="image_set">图集定制（旧）</option>
              </select>

              <select
                name="sort"
                defaultValue={sort}
                className="h-11 w-full rounded-xl bg-[#0B1121] border border-[#334155] px-4 text-slate-100 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50"
              >
                <option value="new">最新</option>
                <option value="price_asc">价格从低到高</option>
                <option value="price_desc">价格从高到低</option>
              </select>

              <button
                type="submit"
                className="h-11 w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-900/20 hover:from-amber-400 hover:to-orange-500 transition-colors"
              >
                筛选
              </button>
            </div>

            {(term || category || sort !== "new") ? (
              <div className="mt-3 text-xs text-slate-400">
                当前筛选：
                {term ? <span className="ml-1 text-slate-200">关键词</span> : null}
                {category ? <span className="ml-2 text-brand-action">分类</span> : null}
                {sort !== "new" ? <span className="ml-2 text-slate-200">排序</span> : null}
                <Link href="/listings" className="ml-3 underline hover:text-white">
                  清除
                </Link>
              </div>
            ) : null}
          </form>
        </header>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-[#334155] bg-[#151F32] px-6 py-16 text-center shadow-xl">
            <div className="text-xl font-extrabold text-white">没有找到相关服务</div>
            <div className="mt-2 text-sm text-slate-400">换个关键词试试？</div>
            <Link
              href="/listings"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-action px-6 py-3 text-sm font-bold text-white transition hover:bg-amber-600"
            >
              清除搜索
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing as any} />
            ))}
          </div>
        )}
      </div>
    );
  } catch (error: any) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="rounded-2xl border border-[#334155] bg-[#151F32] p-6 shadow-2xl">
          <h1 className="text-2xl font-extrabold text-white">探索 AI 服务</h1>
          <p className="mt-3 text-sm text-red-600">{error.message}</p>
        </div>
      </div>
    );
  }
}
