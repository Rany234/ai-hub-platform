import Link from "next/link";

import { Star } from "lucide-react";

import type { Database } from "@/database.types";

export type Listing = Database["public"]["Tables"]["listings"]["Row"];

export function ListingCard({ listing }: { listing: Listing }) {
  const metadata = listing.metadata as unknown as {
    delivery_days?: number;
    seller_avatar_url?: string;
    avg_rating?: number;
    review_count?: number;
  } | null;

  // 1. 核心逻辑：动态展示“起步价”
  const packages = (listing as any).packages as any;
  const basicPrice = packages?.basic?.price;
  const hasBasicPrice = typeof basicPrice === "number";

  // 3. （可选）高级标签
  const premiumPrice = packages?.premium?.price;
  const showPremiumBadge =
    packages?.premium?.enabled !== false &&
    typeof premiumPrice === "number" &&
    premiumPrice > 500 &&
    (!hasBasicPrice || premiumPrice > basicPrice);

  const deliveryDays = metadata?.delivery_days;
  const badge = deliveryDays ? `⚡ ${deliveryDays} 天交付` : "服务";

  const sellerAvatarUrl = metadata?.seller_avatar_url;
  const avgRating = typeof metadata?.avg_rating === "number" ? metadata.avg_rating : null;

  // 提取预览模式下的套餐功能点
  const previewFeatures = packages ? (Object.values(packages) as any[]).find(p => p.price === listing.price)?.features : null;

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="relative border rounded-lg p-4 flex flex-col gap-2 bg-white transition-all duration-300 hover:border-gray-400 hover:-translate-y-1 hover:shadow-xl">
        {showPremiumBadge ? (
          <div className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-purple-500/90 to-fuchsia-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm">
            Premium
          </div>
        ) : avgRating !== null ? (
          <div className="absolute right-3 top-3 rounded-full border bg-white px-2 py-1 text-xs flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-black" />
            <span className="font-medium">{avgRating.toFixed(1)}</span>
          </div>
        ) : null}

        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold leading-tight">{listing.title}</h3>
          <div className="text-sm font-bold text-indigo-600">
            {hasBasicPrice ? `¥${basicPrice} 起` : `¥${listing.price}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full border overflow-hidden bg-white flex items-center justify-center text-[10px] text-muted-foreground">
            {sellerAvatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="seller avatar" src={sellerAvatarUrl} className="h-full w-full object-cover" />
            ) : (
              "无"
            )}
          </div>
          <div className="text-xs text-muted-foreground">卖家</div>
        </div>

        {listing.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
        ) : null}

        {previewFeatures && previewFeatures.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {previewFeatures.map((f: string, i: number) => (
              <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                ✓ {f}
              </span>
            ))}
          </div>
        )}

        {listing.preview_url ? (
          <div className="mt-2 w-full h-40 rounded-md border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={listing.title}
              src={listing.preview_url}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : null}

        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-mono">{badge}</span>
        </div>
      </div>
    </Link>
  );
}
