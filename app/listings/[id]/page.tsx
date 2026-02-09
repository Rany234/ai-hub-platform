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
    <div className="p-6 max-w-6xl mx-auto font-inter">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="flex-1 w-full">
          <h1 className="text-4xl font-jakarta font-extrabold text-slate-900 tracking-tight">{listing.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">服务提供方：</span>
              <span className="text-slate-900 font-bold">
                {creatorProfile?.full_name ||
                  creatorProfile?.username ||
                  creatorProfile?.id ||
                  "未知"}
              </span>
            </div>
            {avgRating !== null ? (
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Star className="h-4 w-4 fill-indigo-500 text-indigo-500" />
                <span className="font-bold text-slate-900">{avgRating.toFixed(1)}</span>
                <span className="text-slate-400 text-xs">({reviewCount}条评价)</span>
              </div>
            ) : (
              <div className="text-xs bg-slate-50 px-3 py-1 rounded-full border border-slate-100 italic">暂无评价</div>
            )}
          </div>
        </div>
        <div className="text-3xl font-jakarta font-extrabold text-indigo-600 bg-indigo-50 px-6 py-2 rounded-xl border border-indigo-100">
          ¥{listing.price}
        </div>
      </div>

      {listing.preview_url ? (
        <div className="mt-8 relative aspect-video w-full max-h-[500px] overflow-hidden rounded-xl border border-slate-200 shadow-sm">
          <img
            alt={listing.title}
            src={listing.preview_url}
            className="w-full h-full object-cover"
          />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-5 transition-colors hover:bg-slate-50">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">分类</div>
          <div className="mt-2 font-jakarta font-bold text-slate-900">{listing.category ?? "未分类"}</div>
        </div>
        <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-5 transition-colors hover:bg-slate-50">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">预计交付</div>
          <div className="mt-2 font-jakarta font-bold text-slate-900">
            {metadata?.delivery_days ? `${metadata.delivery_days} 天` : "（未填写）"}
          </div>
        </div>
      </div>

      {listing.description ? (
        <div className="mt-10">
          <h2 className="text-2xl font-jakarta font-extrabold text-slate-900 tracking-tight">服务介绍</h2>
          <div className="mt-4 p-6 bg-white border border-slate-100 rounded-xl shadow-sm leading-relaxed text-slate-600 whitespace-pre-wrap">
            {listing.description}
          </div>
        </div>
      ) : null}

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-jakarta font-extrabold text-slate-900 mb-6 flex items-center gap-2">
              <span className="h-6 w-1.5 bg-indigo-600 rounded-full" />
              服务配置
            </h2>
            <ServiceConfigurator
              listingId={listing.id}
              basePrice={(() => {
                const packages = (listing as any).packages as any;
                const getPackage = (pkgs: any, tier: "basic" | "standard" | "premium") => {
                  if (!pkgs || typeof pkgs !== "object") return null;
                  const direct = pkgs[tier];
                  if (direct && typeof direct === "object") return direct;
                  const cap = tier.charAt(0).toUpperCase() + tier.slice(1);
                  const alt = pkgs[cap];
                  if (alt && typeof alt === "object") return alt;
                  return null;
                };

                const basic = getPackage(packages, "basic");
                const raw = basic?.price;
                const n = typeof raw === "number" ? raw : typeof raw === "string" ? Number(raw) : NaN;
                if (Number.isFinite(n)) return n;
                return listing.price;
              })()}
              options={((listing.options as unknown) as ServiceOption[] | null) ?? []}
            />
          </div>
        </div>
        <aside className="space-y-6">
          <div className="bg-white border border-slate-100 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-jakarta font-extrabold text-slate-900">卖家信息</h2>
              <ContactSellerButton sellerId={listing.creator_id} listingId={listing.id} />
            </div>
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 rounded-xl border-2 border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                {creatorProfile?.avatar_url ? (
                  <img alt="avatar" src={creatorProfile.avatar_url} className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">无</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-900 truncate">
                  {creatorProfile?.full_name || creatorProfile?.username || "未知卖家"}
                </div>
                {creatorProfile?.bio ? (
                  <div className="mt-2 text-sm text-slate-500 line-clamp-3 italic">
                    “{creatorProfile.bio}”
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-400 italic">暂无简介</div>
                )}
              </div>
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
