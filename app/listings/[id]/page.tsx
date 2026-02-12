import { notFound } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

import { ReviewsSection } from "./ReviewsSection";
import { ServiceConfigurator, type ServiceOption } from "./ServiceConfigurator";
import { ContactSellerButton } from "@/components/ContactSellerButton";
import { Star, Bot, User, Sparkles } from "lucide-react";

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
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="flex-1 w-full">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">{listing.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">服务提供方：</span>
              <span className="text-slate-200 font-bold">
                {creatorProfile?.full_name ||
                  creatorProfile?.username ||
                  creatorProfile?.id ||
                  "未知"}
              </span>
            </div>
            {avgRating !== null ? (
              <div className="flex items-center gap-1.5 bg-brand-surface px-3 py-1 rounded-full border border-brand-border">
                <Star className="h-4 w-4 fill-brand-action text-brand-action" />
                <span className="font-bold text-slate-100">{avgRating.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">({reviewCount}条评价)</span>
              </div>
            ) : (
              <div className="text-xs bg-brand-surface px-3 py-1 rounded-full border border-brand-border text-slate-400 italic">暂无评价</div>
            )}
          </div>
        </div>
        <div className="text-3xl font-extrabold text-brand-action bg-brand-action/10 px-6 py-2 rounded-xl border border-brand-action/20">
          ¥{listing.price}
        </div>
      </div>

      {listing.preview_url ? (
        <div className="mt-8 relative aspect-video w-full max-h-[500px] overflow-hidden rounded-xl border border-brand-border shadow-2xl shadow-black/50">
          <img
            alt={listing.title}
            src={listing.preview_url}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border border-brand-border bg-brand-surface rounded-xl p-5 transition-colors hover:bg-white/5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">分类</div>
          <div className="mt-2 font-bold text-slate-200">{listing.category ?? "未分类"}</div>
        </div>
        <div className="border border-brand-border bg-brand-surface rounded-xl p-5 transition-colors hover:bg-white/5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">预计交付</div>
          <div className="mt-2 font-bold text-slate-200">
            {metadata?.delivery_days ? `${metadata.delivery_days} 天` : "（未填写）"}
          </div>
        </div>
      </div>

      {listing.description ? (
        <div className="mt-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">服务介绍</h2>
          <div className="mt-4 p-6 bg-brand-surface border border-brand-border rounded-xl leading-relaxed text-slate-300 whitespace-pre-wrap shadow-inner shadow-black/20">
            {listing.description}
          </div>
        </div>
      ) : null}

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
              <span className="h-6 w-1.5 bg-brand-action rounded-full" />
              服务配置
            </h2>
            <ServiceConfigurator
              listingId={listing.id}
              basePrice={listing.price}
              options={((listing.options as unknown) as ServiceOption[] | null) ?? []}
              packages={listing.packages}
            />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-extrabold text-white">卖家信息</h2>
              <ContactSellerButton sellerId={listing.creator_id} listingId={listing.id} />
            </div>
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 rounded-xl border border-brand-border overflow-hidden bg-black/20 flex-shrink-0">
                {creatorProfile?.avatar_url ? (
                  <img alt="avatar" src={creatorProfile.avatar_url} className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">无</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-100 truncate">
                  {creatorProfile?.full_name || creatorProfile?.username || "未知卖家"}
                </div>
                {creatorProfile?.bio ? (
                  <div className="mt-2 text-sm text-slate-400 line-clamp-3 italic">
                    “{creatorProfile.bio}”
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-500 italic">暂无简介</div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#151F32]/50 p-5 backdrop-blur-sm mt-6">
            <h4 className="flex items-center gap-2 text-sm font-medium text-slate-400 mb-4">
              <Sparkles className="h-4 w-4 text-amber-500" />
              共创信息 (Co-Creation)
            </h4>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-400">主创 (Architect)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">
                    {creatorProfile?.full_name || creatorProfile?.username || "Anonymous"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-400">协创 (Co-Pilot)</span>
                </div>
                <span className="text-sm font-medium text-brand-action">{(listing as any)?.base_model || "AI Model"}</span>
              </div>

              {(listing as any)?.credits ? (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-2">灵感致谢 (Credits)</p>
                  <blockquote className="border-l-2 border-amber-500/50 pl-3 text-sm italic text-slate-300">
                    “{(listing as any).credits}”
                  </blockquote>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-16">
        <ReviewsSection reviews={(reviews as any) ?? []} />
      </div>
    </div>
  );
}
