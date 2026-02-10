import Link from "next/link";

import { Star } from "lucide-react";

import type { Database } from "@/database.types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

export function BentoCard({
  listing,
  featured,
}: {
  listing: Listing;
  featured?: boolean;
}) {
  const metadata = listing.metadata as unknown as {
    seller_avatar_url?: string;
    avg_rating?: number;
  } | null;

  const sellerAvatarUrl = metadata?.seller_avatar_url;
  const avgRating = typeof metadata?.avg_rating === "number" ? metadata.avg_rating : null;

  // 1. 核心逻辑：动态展示“起步价”
  const packages = (listing as any).packages as any;
  const basicPrice = packages?.basic?.price;
  const hasBasicPrice = typeof basicPrice === "number";
  
  // 3. 高级标签逻辑
  const premiumPrice = packages?.premium?.price;
  const showPremiumBadge = 
    packages?.premium?.enabled !== false && 
    typeof premiumPrice === "number" && 
    premiumPrice > 500 && 
    (!hasBasicPrice || premiumPrice > basicPrice);

  const className = featured
    ? "group relative overflow-hidden rounded-3xl shadow-2xl bg-[#151F32]/80 border border-[#334155] backdrop-blur col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-action/10"
    : "group relative overflow-hidden rounded-3xl shadow-2xl bg-[#151F32]/80 border border-[#334155] backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-brand-action/10";

  return (
    <Link href={`/listings/${listing.id}`} className={className}>
      <div className="absolute inset-0 overflow-hidden">
        {featured ? (
          <video
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
            poster={listing.preview_url ?? undefined}
          >
            <source src="https://cdn.coverr.co/videos/coverr-abstract-liquid-art-1035/1080p.mp4" type="video/mp4" />
          </video>
        ) : listing.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            alt={listing.title} 
            src={listing.preview_url} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="h-full w-full bg-[#0B1121] transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1121]/90 via-[#0B1121]/40 to-transparent" />

      {/* Premium Badge */}
      {showPremiumBadge && (
        <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
          Premium 专家级
        </div>
      )}

      {avgRating !== null ? (
        <div className="absolute right-4 top-4 rounded-full bg-black/40 border border-white/10 backdrop-blur-md px-2.5 py-1 text-xs flex items-center gap-1 shadow-lg text-white">
          <Star className="h-3.5 w-3.5 fill-brand-action text-brand-action" />
          <span className="font-medium">{avgRating.toFixed(1)}</span>
        </div>
      ) : null}

      <div className="absolute left-0 right-0 bottom-0 p-5">
        <div className="text-white text-shadow-sm">
          <div className={featured ? "text-xl font-bold" : "text-base font-bold"}>
            {listing.title}
          </div>
          {listing.description ? (
            <div className="mt-1 text-sm text-slate-300 line-clamp-2">{listing.description}</div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full overflow-hidden border border-white/10 bg-slate-800 flex items-center justify-center text-[10px] text-slate-400">
              {sellerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="seller avatar" src={sellerAvatarUrl} className="h-full w-full object-cover" />
              ) : (
                "无"
              )}
            </div>
            <div className="text-xs text-slate-400">卖家</div>
          </div>

          <div className="rounded-full bg-brand-action px-3 py-1 text-xs font-bold text-white shadow-lg transition-colors hover:bg-amber-600">
            {hasBasicPrice ? `¥${basicPrice} 起` : `¥${listing.price}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
