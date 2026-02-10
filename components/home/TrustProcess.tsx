"use client";

import { motion, useInView } from "framer-motion";
import { useMemo, useRef } from "react";
import { Code2, Lock, ScanEye, Wallet } from "lucide-react";

type Step = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: "amber" | "purple" | "cyan" | "emerald";
};

const steps: Step[] = [
  {
    title: "资金托管",
    description: "雇主托管资金，平台监管保护",
    Icon: Lock,
    accent: "amber",
  },
  {
    title: "交付开发",
    description: "专家按期交付源码或资产",
    Icon: Code2,
    accent: "purple",
  },
  {
    title: "验收确认",
    description: "雇主验收确认，无误后放款",
    Icon: ScanEye,
    accent: "cyan",
  },
  {
    title: "自动结算",
    description: "资金释放给专家，T+14 自动入账",
    Icon: Wallet,
    accent: "emerald",
  },
];

function accentStyles(accent: Step["accent"]) {
  switch (accent) {
    case "amber":
      return {
        icon: "text-amber-300",
        glow: "shadow-amber-500/10",
        ring: "ring-amber-500/20",
        dot: "bg-amber-400",
      };
    case "purple":
      return {
        icon: "text-purple-200",
        glow: "shadow-purple-500/10",
        ring: "ring-purple-500/20",
        dot: "bg-purple-400",
      };
    case "cyan":
      return {
        icon: "text-cyan-200",
        glow: "shadow-cyan-500/10",
        ring: "ring-cyan-500/20",
        dot: "bg-cyan-400",
      };
    default:
      return {
        icon: "text-emerald-200",
        glow: "shadow-emerald-500/10",
        ring: "ring-emerald-500/20",
        dot: "bg-emerald-400",
      };
  }
}

export function TrustProcess() {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const lineVariants = useMemo(
    () => ({
      hidden: { scaleX: 0, opacity: 0.5 },
      show: {
        scaleX: 1,
        opacity: 1,
        transition: { duration: 1.2, ease: "easeOut", delay: 0.2 },
      },
    }),
    []
  );

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: 0.16, delayChildren: 0.15 } },
    }),
    []
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 10 },
      show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
    }),
    []
  );

  return (
    <div ref={ref} className="relative">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-md shadow-2xl shadow-black/20">
        {/* Subtle noise / grid */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:18px_18px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_15%_20%,rgba(245,158,11,0.10),transparent_55%),radial-gradient(900px_circle_at_85%_75%,rgba(14,165,233,0.08),transparent_55%)]" />

        <div className="relative">
          {/* Desktop connecting line */}
          <div className="hidden md:block absolute left-8 right-8 top-[36px]">
            <div className="h-px w-full bg-white/10" />
            <motion.div
              className="absolute inset-0 origin-left"
              variants={lineVariants}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
            >
              <div className="h-px w-full bg-gradient-to-r from-amber-500/60 via-purple-500/60 via-cyan-400/60 to-emerald-400/60" />
              <div className="absolute -top-1 h-3 w-24 bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md animate-[trustFlow_3.2s_linear_infinite]" />
            </motion.div>
          </div>

          {/* Mobile connecting line */}
          <div className="md:hidden absolute left-[22px] top-10 bottom-10">
            <div className="w-px h-full bg-white/10" />
            <motion.div
              className="absolute inset-0 origin-top"
              initial={{ scaleY: 0, opacity: 0.5 }}
              animate={inView ? { scaleY: 1, opacity: 1 } : { scaleY: 0, opacity: 0.5 }}
              transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
            >
              <div className="w-px h-full bg-gradient-to-b from-amber-500/60 via-purple-500/60 via-cyan-400/60 to-emerald-400/60" />
            </motion.div>
          </div>

          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-4 md:gap-6"
            variants={containerVariants}
            initial="hidden"
            animate={inView ? "show" : "hidden"}
          >
            {steps.map((step) => {
              const s = accentStyles(step.accent);
              const Icon = step.Icon;

              return (
                <motion.div
                  key={step.title}
                  variants={itemVariants}
                  className="relative"
                >
                  <div className={`relative rounded-2xl border border-white/10 bg-black/20 p-5 backdrop-blur shadow-xl ${s.glow} ring-1 ${s.ring}`}>
                    <div className="flex items-start gap-3">
                      <div className={`relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 ${s.glow}`}>
                        <Icon className={`h-5 w-5 ${s.icon}`} />
                        <span className={`absolute -bottom-2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full ${s.dot} shadow-[0_0_18px_rgba(255,255,255,0.12)]`} />
                      </div>

                      <div className="min-w-0">
                        <div className="text-sm font-extrabold text-white">{step.title}</div>
                        <div className="mt-1 text-sm leading-5 text-slate-400">{step.description}</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
