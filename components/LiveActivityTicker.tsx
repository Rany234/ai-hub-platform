"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

const activities = [
  { id: 1, text: "🔥 [悬赏] RAG 知识库搭建 (¥2000) - 招标中", time: "刚刚" },
  { id: 2, text: "⚡️ [Remix] '智能翻译助手' 被派生，原始创作者获得版税 ¥50", time: "3分钟前" },
  { id: 3, text: "💎 [新资产] 'DeepSeek 优化 Prompt 集' 已确权上架", time: "12分钟前" },
  { id: 4, text: "🔥 [悬赏] 企业级多代理协作方案 (¥8000) - 已达成", time: "25分钟前" },
];

export function LiveActivityTicker() {
  return (
    <div className="border-y border-white/5 bg-slate-950/50 py-3 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="flex items-center gap-2 whitespace-nowrap text-xs font-bold text-brand-action">
            <Zap className="h-3.5 w-3.5 fill-brand-action" />
            实时动态
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-12 whitespace-nowrap"
            >
              {[...activities, ...activities].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span className="text-slate-300 font-medium">{item.text}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-tighter">{item.time}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
