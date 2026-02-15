import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

import { ReviewsSection } from "./ReviewsSection";
import { ServiceConfigurator, type ServiceOption } from "./ServiceConfigurator";
import { ContactSellerButton } from "@/components/ContactSellerButton";
import { RemixButton } from "./RemixButton";
import { RemixTree } from "@/features/listings/components/RemixTree";

import { Star, Bot, User, Sparkles, Zap, GitFork } from "lucide-react";

function assertString(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) throw new Error("无效的服务 ID");
  return v;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;
  const listingId = assertString(id);

  const listing = (await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          fullName: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
          creatorId: true,
        },
      },
    } as any,
  })) as any;

  if (!listing) {
    notFound();
  }

  const creatorProfile = listing.creator;

  // 暂时模拟评价数据，因为当前 schema 还没有 Review 模型
  const reviews: any[] = [];
  const avgRating = null as number | null;
  const reviewCount = 0;

  const metadata = listing.metadata as unknown as { delivery_days?: number } | null;

  const showRemixBanner = Boolean(listing.isRemix && listing.parentId && listing.parent);
  const showRemixAction = listing.type === "ASSET" && Boolean(session?.user?.id);

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="flex-1 w-full">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">{listing.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-400 font-medium">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">服务提供方：</span>
              <span className="text-slate-200 font-bold">
                {creatorProfile?.fullName || creatorProfile?.username || creatorProfile?.id || "未知"}
              </span>
            </div>
            {avgRating !== null ? (
              <div className="flex items-center gap-1.5 bg-brand-surface px-3 py-1 rounded-full border border-brand-border">
                <Star className="h-4 w-4 fill-brand-action text-brand-action" />
                <span className="font-bold text-slate-100">{avgRating.toFixed(1)}</span>
                <span className="text-slate-500 text-xs">({reviewCount}条评价)</span>
              </div>
            ) : (
              <div className="text-xs bg-brand-surface px-3 py-1 rounded-full border border-brand-border text-slate-400 italic">
                暂无评价
              </div>
            )}
          </div>
        </div>
        <div className="text-3xl font-extrabold text-brand-action bg-brand-action/10 px-6 py-2 rounded-xl border border-brand-action/20">
          ¥{listing.price}
        </div>
      </div>

      {listing.previewUrl ? (
        <div className="mt-8 relative aspect-video w-full max-h-[500px] overflow-hidden rounded-xl border border-brand-border shadow-2xl shadow-black/50">
          <img alt={listing.title} src={listing.previewUrl} className="w-full h-full object-cover" />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="border border-brand-border bg-brand-surface rounded-xl p-5 transition-colors hover:bg-white/5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">分类</div>
          <div className="mt-2 font-bold text-slate-200">{listing.category ?? "未分类"}</div>
        </div>
        <div className="border border-brand-border bg-brand-surface rounded-xl p-5 transition-colors hover:bg-white/5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">预计交付</div>
          <div className="mt-2 font-bold text-slate-200">{metadata?.delivery_days ? `${metadata.delivery_days} 天` : "（未填写）"}</div>
        </div>
      </div>

      {listing.description ? (
        <div className="mt-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">服务介绍</h2>

          <div className="mt-4 p-6 bg-brand-surface border border-brand-border rounded-xl leading-relaxed text-slate-300 whitespace-pre-wrap shadow-inner shadow-black/20">
            {showRemixBanner ? (
              <div className="mb-5 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-bold text-purple-200">
                  <Zap className="h-4 w-4" />
                  <span>
                    派生自{" "}
                    <Link href={`/listings/${encodeURIComponent(listing.parent!.id)}`} className="underline underline-offset-2 hover:text-white">
                      {listing.parent!.title}
                    </Link>
                  </span>
                </div>
                <div className="mt-1 text-xs text-purple-200/80">♻️ 每笔成交的 10% 将返还给原始创作者。</div>
              </div>
            ) : null}

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
              packages={(listing as any).packages}
            />
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-brand-surface border border-brand-border rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 className="text-lg font-extrabold text-white">卖家信息</h2>
              <div className="flex items-center gap-2">
                {showRemixAction ? (
                  <RemixButton originalListingId={listing.id} currentUserId={session!.user!.id as string} />
                ) : null}
                <ContactSellerButton sellerId={listing.creatorId} listingId={listing.id} />
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="relative h-14 w-14 rounded-xl border border-brand-border overflow-hidden bg-black/20 flex-shrink-0">
                {creatorProfile?.avatarUrl ? (
                  <img alt="avatar" src={creatorProfile.avatarUrl} className="h-full w-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">无</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="font-bold text-slate-100 truncate">{creatorProfile?.fullName || creatorProfile?.username || "未知卖家"}</div>
                <div className="mt-2 text-sm text-slate-500 italic">暂无简介</div>
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
                  <span className="text-sm font-medium text-slate-200">{creatorProfile?.fullName || creatorProfile?.username || "Anonymous"}</span>
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
                  <blockquote className="border-l-2 border-amber-500/50 pl-3 text-sm italic text-slate-300">“{(listing as any).credits}”</blockquote>
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-16">
        <ReviewsSection reviews={(reviews as any) ?? []} />
      </div>

      <div className="mt-16">
        <div className="flex items-center gap-2 mb-4">
          <GitFork className="h-5 w-5 text-slate-400" />
          <h2 className="text-2xl font-extrabold text-white tracking-tight">🧬 演化谱系 (Evolution Tree)</h2>
        </div>
        <RemixTree listingId={listing.id} />
      </div>
    </div>
  );
}
