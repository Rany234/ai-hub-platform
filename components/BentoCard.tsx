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
    ? "group relative overflow-hidden rounded-3xl shadow-sm bg-white/60 backdrop-blur col-span-1 sm:col-span-2 row-span-1 sm:row-span-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    : "group relative overflow-hidden rounded-3xl shadow-sm bg-white/60 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl";

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
          <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Premium Badge */}
      {showPremiumBadge && (
        <div className="absolute left-4 top-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
          Premium 专家级
        </div>
      )}

      {avgRating !== null ? (
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-2.5 py-1 text-xs flex items-center gap-1 shadow">
          <Star className="h-3.5 w-3.5 fill-black" />
          <span className="font-medium">{avgRating.toFixed(1)}</span>
        </div>
      ) : null}

      <div className="absolute left-0 right-0 bottom-0 p-5">
        <div className="text-white text-shadow-sm">
          <div className={featured ? "text-xl font-semibold" : "text-base font-semibold"}>
            {listing.title}
          </div>
          {listing.description ? (
            <div className="mt-1 text-sm text-white/90 line-clamp-2">{listing.description}</div>
          ) : null}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full overflow-hidden bg-white/90 flex items-center justify-center text-[10px] text-muted-foreground">
              {sellerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="seller avatar" src={sellerAvatarUrl} className="h-full w-full object-cover" />
              ) : (
                "无"
              )}
            </div>
            <div className="text-xs text-white/80">卖家</div>
          </div>

          <div className="rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-600 shadow-sm transition-colors group-hover:bg-indigo-50">
            {hasBasicPrice ? `¥${basicPrice} 起` : `¥${listing.price}`}
          </div>
        </div>
      </div>
    </Link>
  );
}
