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
      className={`group relative ${heightClass} flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#151F32] shadow-2xl transition-all duration-500 hover:border-brand-action/30`}
    >
      {/* Top Image Section - 65% Height */}
      <div className="relative h-[65%] w-full overflow-hidden">
        {listing.preview_url ? (
          <Image
            src={listing.preview_url}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
          />
        ) : (
          <div className="h-full w-full bg-[#0B1121]" />
        )}
        
        {/* Simple ambient top overlay to keep the top edges clean */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      {/* Bottom Text Section - 35% Height / Flex-1 */}
      <div className="flex flex-1 flex-col justify-between border-t border-white/5 bg-[#151F32] p-6">
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-white line-clamp-1 transition-colors group-hover:text-brand-action">
            {listing.title}
          </h3>

          <div className="flex items-center gap-2">
            <div className="relative h-6 w-6 overflow-hidden rounded-full border border-white/10 bg-slate-800">
              {sellerAvatarUrl ? (
                <Image src={sellerAvatarUrl} alt={sellerName} fill className="object-cover" />
              ) : (
                <User className="p-1 text-slate-400" />
              )}
            </div>
            <span className="text-xs text-slate-300 font-medium">{sellerName}</span>
          </div>
        </div>

        <div className="mt-4">
          <Link
            href={`/listings/${listing.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-action hover:border-brand-action hover:text-white active:scale-[0.98]"
          >
            查看详情
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
