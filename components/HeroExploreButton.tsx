"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function HeroExploreButton() {
  return (
    <motion.div
      animate={{
        boxShadow: [
          "0 0 0 rgba(99,102,241,0.0)",
          "0 0 28px rgba(99,102,241,0.35)",
          "0 0 0 rgba(99,102,241,0.0)",
        ],
      }}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex rounded-full"
    >
      <Link
        href="/listings"
        className="relative inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur"
      >
        探索服务
      </Link>
    </motion.div>
  );
}
