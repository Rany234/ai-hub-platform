import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

import { ReviewsSection } from "./ReviewsSection";
import { ServiceConfigurator, type ServiceOption } from "./ServiceConfigurator";
import { ContactSellerButton } from "@/components/ContactSellerButton";
import { Star } from "lucide-react";

function assertString(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) throw new Error("无效的服务 ID");
  return v;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = assertString(id);

  const supabase = await createSupabaseServerClient();

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    notFound();
  }

  const { data: creatorProfile } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role, created_at, bio")
    .eq("id", listing.creator_id)
    .maybeSingle();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("rating, content, created_at, reviewer_id, profiles(id, username, full_name, avatar_url)")
    .eq("listing_id", listing.id)
    .order("created_at", { ascending: false });

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : null;
  const reviewCount = reviews?.length ?? 0;

  const metadata = listing.metadata as unknown as { delivery_days?: number } | null;

  return (
    <div className="container mx-auto px-4 py-8 font-inter">
      {/* Breadcrumbs - Placeholder for better UX */}
      <nav className="flex mb-6 text-sm text-slate-500 gap-2">
        <a href="/" className="hover:text-brand-primary transition-colors">首页</a>
        <span>/</span>
        <a href="/listings" className="hover:text-brand-primary transition-colors">{listing.category ?? "服务"}</a>
        <span>/</span>
        <span className="text-slate-900 font-medium truncate">{listing.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 左侧主要内容 */}
        <div className="lg:col-span-8">
          <h1 className="text-4xl font-jakarta font-extrabold text-slate-900 tracking-tight mb-6">
            {listing.title}
          </h1>

          {/* 评价简述 */}
          <div className="flex items-center gap-4 mb-8">
            {avgRating !== null ? (
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-brand-primary text-brand-primary" />
                <span className="font-bold text-lg text-slate-900">{avgRating.toFixed(1)}</span>
                <span className="text-slate-500">({reviewCount} 条真实评价)</span>
              </div>
            ) : (
              <span className="text-slate-400 italic">暂无评价</span>
            )}
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">服务商：</span>
              <span className="text-brand-primary font-bold hover:underline cursor-pointer">
                {creatorProfile?.full_name || creatorProfile?.username || "未知"}
              </span>
            </div>
          </div>

          {/* 图片预览 */}
          {listing.preview_url ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm mb-10 group">
              <img
                alt={listing.title}
                src={listing.preview_url}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-slate-100 rounded-2xl flex items-center justify-center mb-10">
              <span className="text-slate-400">暂无预览图</span>
            </div>
          )}

          {/* 描述区域 */}
          <div className="mb-12">
            <h2 className="text-2xl font-jakarta font-extrabold text-slate-900 tracking-tight mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 bg-brand-primary rounded-full"></span>
              服务详情
            </h2>
            <div className="prose prose-slate max-w-none p-8 bg-white dark:bg-brand-dark/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {listing.description || "暂无详细介绍"}
            </div>
          </div>

          {/* 评价区域 */}
          <div className="mt-16">
            <ReviewsSection reviews={(reviews as any) ?? []} />
          </div>
        </div>

        {/* 右侧侧边栏 - 吸顶 */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="sticky top-24 h-fit space-y-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-brand-dark border border-indigo-100/20 dark:border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              {/* 装饰性背景 */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-brand-primary/5 rounded-full blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl font-bold text-brand-primary">¥{listing.price}</span>
                  <span className="text-slate-400 text-sm font-medium">起</span>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500">预计交付时间</span>
                    <span className="text-slate-900 dark:text-slate-200 font-bold">
                      {metadata?.delivery_days ? `${metadata.delivery_days} 天` : "商议确定"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <span className="text-slate-500">服务分类</span>
                    <span className="text-slate-900 dark:text-slate-200 font-bold">{listing.category ?? "AI 服务"}</span>
                  </div>
                </div>

                {/* 服务配置器 - 下单逻辑核心 */}
                <ServiceConfigurator
                  listingId={listing.id}
                  basePrice={listing.price}
                  options={((listing.options as unknown) as ServiceOption[] | null) ?? []}
                  packages={listing.packages}
                />
                
                <p className="mt-4 text-center text-xs text-slate-400">
                  下单后即可在工作台与卖家开始沟通
                </p>
              </div>
            </div>

            {/* Seller Card */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">关于卖家</h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200/80 dark:border-slate-700 bg-transparent px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 transition-colors"
                  >
                    Contact Me
                  </button>
                  <ContactSellerButton sellerId={listing.creator_id} listingId={listing.id} />
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative h-16 w-16 rounded-2xl border-2 border-white dark:border-slate-800 shadow-sm overflow-hidden bg-white">
                  {creatorProfile?.avatar_url ? (
                    <img alt="avatar" src={creatorProfile.avatar_url} className="h-full w-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold">
                      {creatorProfile?.full_name?.[0] || "?"}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                    {creatorProfile?.full_name || creatorProfile?.username || "匿名卖家"}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                    在线
                  </div>
                </div>
              </div>
              
              {creatorProfile?.bio && (
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed bg-white/50 dark:bg-white/5 p-3 rounded-xl italic">
                  “{creatorProfile.bio}”
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
