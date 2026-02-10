"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Undo2, Code2, BadgeDollarSign, Globe2, Wallet } from "lucide-react";

type Audience = "employer" | "expert";

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
    <div className="mt-8 w-full max-w-2xl flex flex-col items-center justify-center text-center">
      <div className="flex justify-center">
        <div className="relative mx-auto flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-md shadow-lg">
          <button
            type="button"
            onClick={() => setAudience("employer")}
            className="relative z-10 px-4 sm:px-5 h-10 rounded-full text-xs sm:text-sm font-semibold transition-colors text-slate-200"
          >
            我是雇主
            <span className="ml-2 hidden sm:inline text-[11px] font-medium text-slate-400">
              (Find Talent)
            </span>
            {audience === "employer" ? (
              <motion.div
                layoutId="heroAudiencePill"
                className="absolute inset-0 -z-10 rounded-full bg-brand-action/20"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setAudience("expert")}
            className="relative z-10 px-4 sm:px-5 h-10 rounded-full text-xs sm:text-sm font-semibold transition-colors text-slate-200"
          >
            我是专家
            <span className="ml-2 hidden sm:inline text-[11px] font-medium text-slate-400">
              (Find Work)
            </span>
            {audience === "expert" ? (
              <motion.div
                layoutId="heroAudiencePill"
                className="absolute inset-0 -z-10 rounded-full bg-purple-500/20"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            ) : null}
          </button>
        </div>
      </div>

      <div className="mt-5 w-full mx-auto flex flex-col items-center text-center rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={audience}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex flex-col items-center w-full"
          >
            <div className="w-full mx-auto text-center text-base sm:text-lg font-extrabold tracking-tight text-white">
              {content.headline}
            </div>

            <div className="mt-4 mx-auto grid w-full place-items-center grid-cols-1 gap-3 sm:grid-cols-3">
              {content.features.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.text}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200"
                  >
                    <Icon className="h-4 w-4 text-brand-action" />
                    <span className="leading-5">{f.text}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
