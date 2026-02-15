"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, User } from "lucide-react";
import type { Listing } from "@prisma/client";

interface FeaturedWorkCardProps {
  listing: Listing;
  index: number;
}

export function FeaturedWorkCard({ listing, index }: FeaturedWorkCardProps) {
  const metadata = listing.metadata as any;
  const sellerAvatarUrl = metadata?.seller_avatar_url;
  const sellerName = metadata?.seller_name || "AI 创作者";

  // 根据索引决定高度，模拟瀑布流错落感
  const heights = ["h-[300px]", "h-[400px]", "h-[350px]", "h-[450px]"];
  const heightClass = heights[index % heights.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`group relative ${heightClass} overflow-hidden rounded-[2rem] border border-[#334155] bg-[#151F32] shadow-2xl transition-all duration-500 hover:shadow-brand-action/10`}
    >
      {/* 作品图片 */}
      {listing.previewUrl ? (
        <Image
          src={listing.previewUrl}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // 使用简单的透明占位图
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
        />
      ) : (
        <div className="h-full w-full bg-[#0B1121]" />
      )}

      {/* 渐变遮罩 */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

      {/* 内容区域 */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        <div className="translate-y-4 transition-transform duration-500 group-hover:translate-y-0">
          <h3 className="text-lg font-bold text-white line-clamp-1">{listing.title}</h3>
          
          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/10 bg-slate-800">
              {sellerAvatarUrl ? (
                <Image src={sellerAvatarUrl} alt={sellerName} fill className="object-cover" />
              ) : (
                <User className="p-1 text-slate-400" />
              )}
            </div>
            <span className="text-xs text-slate-300">{sellerName}</span>
          </div>
        </div>

        {/* Hover 浮现按钮 */}
        <div className="mt-4 translate-y-8 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-action px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/20 transition-transform hover:scale-[1.02] hover:bg-amber-600 active:scale-[0.98]"
          >
            查看此服务的 AI 套餐
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* 边框高光效果 */}
      <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/5 ring-1 ring-inset ring-white/5 group-hover:ring-white/10" />
    </motion.div>
  );
}
