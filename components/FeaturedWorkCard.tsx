"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, User } from "lucide-react";
import type { Database } from "@/database.types";

type Listing = Database["public"]["Tables"]["listings"]["Row"];

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
      className={`group relative ${heightClass} overflow-hidden rounded-3xl border border-white/10 bg-[#151F32] shadow-2xl transition-all duration-500 hover:border-brand-action/30`}
    >
      {/* 作品图片 - 使用用户提供的深色高质量抽象图 */}
      <Image
        src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        alt={listing.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={index < 2}
      />

      {/* 底部渐变遮罩 - 双重保障 */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* 内容区域 - 恢复覆盖布局，利用深色背景确保清晰度 */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-6">
        <div className="translate-y-2 transition-transform duration-500 group-hover:translate-y-0">
          <h3 className="text-xl font-bold text-white tracking-tight drop-shadow-sm">
            {listing.title}
          </h3>

          <div className="mt-3 flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/20 bg-slate-800">
              {sellerAvatarUrl ? (
                <Image src={sellerAvatarUrl} alt={sellerName} fill className="object-cover" />
              ) : (
                <User className="p-1 text-slate-400" />
              )}
            </div>
            <span className="text-sm text-slate-200 font-medium drop-shadow-sm">{sellerName}</span>
          </div>
        </div>

        {/* Hover 浮现按钮 */}
        <div className="mt-5 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-action px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-900/40 transition-all hover:bg-amber-500 active:scale-[0.98]"
          >
            查看详情
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
