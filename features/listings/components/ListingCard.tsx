import Link from "next/link";

import { Star, BadgeCheck } from "lucide-react";

import type { Database } from "@/database.types";

export type Listing = Database["public"]["Tables"]["listings"]["Row"];

export function ListingCard({ listing }: { listing: Listing }) {
  const metadata = listing.metadata as unknown as {
    delivery_days?: number;
    seller_avatar_url?: string;
    avg_rating?: number;
    review_count?: number;
  } | null;

  const packages = (listing as any).packages as any;
  const basicPrice = packages?.basic?.price;
  const hasBasicPrice = typeof basicPrice === "number";

  const sellerAvatarUrl = metadata?.seller_avatar_url;
  const avgRating = typeof metadata?.avg_rating === "number" ? metadata.avg_rating : 4.9;
  const reviewCount = typeof metadata?.review_count === "number" ? metadata.review_count : 128;

  const priceText = hasBasicPrice ? `¥${basicPrice}` : `¥${listing.price}`;

  return (
    <Link href={`/listings/${listing.id}`} className="block group">
      <div className="rounded-xl bg-[#151F32] border border-[#334155] overflow-hidden transition-all duration-300 hover:border-indigo-500">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden">
          {listing.preview_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={listing.title}
              src={listing.preview_url}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-[#0B1120]" />
          )}

          {/* Verified badge */}
          <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 backdrop-blur">
            <BadgeCheck className="h-3.5 w-3.5" />
            Verified
          </div>
        </div>

        {/* Info */}
        <div className="relative px-5 pt-0 pb-4">
          {/* Avatar */}
          <div className="-mt-5 mb-3">
            <div className="h-10 w-10 rounded-full border border-[#334155] bg-[#0B1120] overflow-hidden">
              {sellerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="seller avatar"
                  src={sellerAvatarUrl}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-xs text-slate-500">
                  AI
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-white leading-snug line-clamp-2 min-h-[2.75rem]">
            {listing.title}
          </h3>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-1 text-white">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
            </div>
            <span className="text-slate-400">({reviewCount} reviews)</span>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-[#334155] flex items-end justify-between">
            <div className="text-xs text-slate-400">Starting at</div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{priceText}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
