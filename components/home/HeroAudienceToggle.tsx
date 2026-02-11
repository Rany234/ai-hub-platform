"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Undo2, Code2, BadgeDollarSign, Globe2, Wallet } from "lucide-react";

type Audience = "employer" | "creator";

export function HeroAudienceToggle() {
  const [audience, setAudience] = useState<Audience>("employer");

  const content = useMemo(() => {
    if (audience === "employer") {
      return {
        headline: "全球顶尖 AI 人才，为您交付结果。",
        features: [
          { icon: ShieldCheck, text: "100% 资金托管" },
          { icon: Undo2, text: "不满意全额退款" },
          { icon: Code2, text: "拥有源码所有权" },
        ],
      };
    }

    return {
      headline: "将您的 AI 技能转化为持久的被动收入。",
      features: [
        { icon: BadgeDollarSign, text: "0 入驻费" },
        { icon: Globe2, text: "全球客户资源" },
        { icon: Wallet, text: "T+14 自动结算" },
      ],
    };
  }, [audience]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-3xl border border-white/10 bg-[#151F32]/50 p-6 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 w-fit">
            <button
              type="button"
              onClick={() => setAudience("employer")}
              className="relative z-10 px-4 h-9 rounded-full text-xs font-bold transition-colors text-slate-200"
            >
              我是雇主
              {audience === "employer" ? (
                <motion.div
                  layoutId="heroAudiencePill"
                  className="absolute inset-0 -z-10 rounded-full bg-amber-500/20 border border-amber-500/20"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              ) : null}
            </button>

            <button
              type="button"
              onClick={() => setAudience("creator")}
              className="relative z-10 px-4 h-9 rounded-full text-xs font-bold transition-colors text-slate-200"
            >
              我是创作者
              {audience === "creator" ? (
                <motion.div
                  layoutId="heroAudiencePill"
                  className="absolute inset-0 -z-10 rounded-full bg-amber-500/20 border border-amber-500/20"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              ) : null}
            </button>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {content.headline}
            </h3>
            <p className="text-xs text-slate-400">
              {audience === "employer" ? "连接全球顶尖 AI 专家" : "让你的 AI 技能产生被动收入"}
            </p>
          </div>
        </div>

        <div className="h-px w-full md:h-12 md:w-px bg-white/10" />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
          {content.features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.text}
                className="flex items-center gap-3 group"
              >
                <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{f.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
