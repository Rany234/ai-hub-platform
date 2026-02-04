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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{listing.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <div>
              服务提供方：
              {creatorProfile?.full_name ||
                creatorProfile?.username ||
                creatorProfile?.id ||
                "未知"}
            </div>
            {avgRating !== null ? (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-black" />
                <span className="font-medium text-foreground">{avgRating.toFixed(1)}</span>
                <span>({reviewCount}条评价)</span>
              </div>
            ) : (
              <div className="text-xs">暂无评价</div>
            )}
          </div>
        </div>
        <div className="text-lg font-semibold">¥{listing.price}</div>
      </div>

      {listing.preview_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={listing.title}
          src={listing.preview_url}
          className="mt-6 w-full max-h-[420px] object-cover rounded-lg border"
        />
      ) : null}

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">分类</div>
          <div className="mt-1 font-mono">{listing.category ?? "未分类"}</div>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-xs text-muted-foreground">预计交付</div>
          <div className="mt-1 font-mono">
            {metadata?.delivery_days ? `${metadata.delivery_days} 天` : "（未填写）"}
          </div>
        </div>
      </div>

      {listing.description ? (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">服务介绍</h2>
          <p className="mt-2 whitespace-pre-wrap">{listing.description}</p>
        </div>
      ) : null}

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-4">
            <div className="text-sm font-semibold">服务配置</div>
            <div className="mt-4">
              <ServiceConfigurator
                listingId={listing.id}
                basePrice={listing.price}
                options={((listing.options as unknown) as ServiceOption[] | null) ?? []}
              />
            </div>
          </div>
        </div>
        <aside className="border rounded-lg p-4">
          <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">卖家信息</div>
            <ContactSellerButton sellerId={listing.creator_id} listingId={listing.id} />
          </div>
          <div className="mt-4 flex items-start gap-3">
            <div className="h-12 w-12 rounded-full border overflow-hidden bg-white flex items-center justify-center text-xs text-muted-foreground">
              {creatorProfile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="avatar" src={creatorProfile.avatar_url} className="h-full w-full object-cover" />
              ) : (
                "无"
              )}
            </div>
            <div>
              <div className="font-medium">
                {creatorProfile?.full_name || creatorProfile?.username || "未知卖家"}
              </div>
              {creatorProfile?.bio ? (
                <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">
                  {creatorProfile.bio}
                </div>
              ) : (
                <div className="mt-1 text-sm text-muted-foreground">暂无简介</div>
              )}
            </div>
          </div>
        </aside>
      </div>

      <ReviewsSection reviews={(reviews as any) ?? []} />
    </div>
  );
}
