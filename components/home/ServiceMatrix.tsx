import Link from "next/link";

import { motion } from "framer-motion";
import { Image as ImageIcon, SlidersHorizontal, ServerCog } from "lucide-react";

type ServiceLevel = {
  level: "Level 1" | "Level 2" | "Level 3";
  title: string;
  description: string;
  examples: string;
  href: string;
  accent: "amber" | "purple" | "sky";
  Icon: React.ComponentType<{ className?: string }>;
};

const LEVELS: ServiceLevel[] = [
  {
    level: "Level 1",
    title: "AI 数字资产 (Assets)",
    description: "即买即用的生产力原子。",
    examples: "示例：Midjourney Prompts、Stable Diffusion LoRA 模型、ComfyUI 工作流文件",
    href: "/listings?category=assets",
    accent: "amber",
    Icon: ImageIcon,
  },
  {
    level: "Level 2",
    title: "定制化服务 (Services)",
    description: "专家一对一调试与生成。",
    examples: "示例：专属 Logo 设计、AI 模特换装、视频风格重绘",
    href: "/listings?category=services",
    accent: "purple",
    Icon: SlidersHorizontal,
  },
  {
    level: "Level 3",
    title: "企业级解决方案 (Solutions)",
    description: "端到端的私有化部署与 Agent 开发。",
    examples: "示例：企业知识库搭建、自动化客服 Agent、私有模型微调",
    href: "/listings?category=solutions",
    accent: "sky",
    Icon: ServerCog,
  },
];

function accentClasses(accent: ServiceLevel["accent"]) {
  if (accent === "amber") {
    return {
      glow: "hover:shadow-amber-500/10",
      border: "hover:border-amber-500/30",
      icon: "text-amber-300",
      pill: "bg-amber-500/15 text-amber-200",
      deco: "group-hover:bg-amber-500/10",
    };
  }
  if (accent === "purple") {
    return {
      glow: "hover:shadow-purple-500/10",
      border: "hover:border-purple-500/30",
      icon: "text-purple-200",
      pill: "bg-purple-500/15 text-purple-200",
      deco: "group-hover:bg-purple-500/10",
    };
  }
  return {
    glow: "hover:shadow-sky-500/10",
    border: "hover:border-sky-500/30",
    icon: "text-sky-200",
    pill: "bg-sky-500/15 text-sky-200",
    deco: "group-hover:bg-sky-500/10",
  };
}

export function ServiceMatrix() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 opacity-[0.035] bg-grid-white/[0.06]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(245,158,11,0.10),transparent_55%),radial-gradient(900px_circle_at_80%_70%,rgba(168,85,247,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.65),rgba(2,6,23,0.92))]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            三级产品形态
          </h2>
          <p className="mt-4 text-base text-slate-400 sm:text-lg">
            从轻量级资产到重量级方案，清晰理解 AI-Hub 的核心业务架构。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {LEVELS.map((item, index) => {
            const a = accentClasses(item.accent);
            const Icon = item.Icon;

            return (
              <Link key={item.level} href={item.href} className="block h-full">
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: index * 0.06 }}
                  whileHover={{ y: -6 }}
                  className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl shadow-black/20 transition-all ${a.border} ${a.glow}`}
                >
                  {/* Noise layer */}
                  <div className="pointer-events-none absolute inset-0 opacity-[0.035] [background-image:radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:18px_18px]" />

                  {/* Top highlight */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/20" />

                  {/* Card-specific visuals */}
                  {item.level === "Level 1" ? (
                    <div className="pointer-events-none absolute inset-0">
                      {/* "AI image" mock */}
                      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_20%,rgba(99,102,241,0.28),transparent_55%),radial-gradient(700px_circle_at_70%_70%,rgba(245,158,11,0.22),transparent_55%),radial-gradient(600px_circle_at_40%_80%,rgba(236,72,153,0.16),transparent_60%)]" />
                      <div className="absolute inset-0 opacity-70 [background:linear-gradient(135deg,rgba(255,255,255,0.06),transparent_35%,rgba(255,255,255,0.04))]" />
                      <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-500/15 blur-[70px]" />
                    </div>
                  ) : null}

                  {item.level === "Level 2" ? (
                    <div className="pointer-events-none absolute inset-0">
                      {/* Before / After abstract split */}
                      <div className="absolute inset-0 grid grid-cols-2">
                        <div className="relative">
                          <div className="absolute inset-0 bg-[radial-gradient(600px_circle_at_40%_30%,rgba(148,163,184,0.10),transparent_65%)]" />
                          <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:10px_10px]" />
                          <div className="absolute inset-0 bg-slate-950/20" />
                        </div>
                        <div className="relative">
                          <div className="absolute inset-0 bg-[radial-gradient(650px_circle_at_60%_40%,rgba(168,85,247,0.22),transparent_60%)]" />
                          <div className="absolute inset-0 opacity-70 [background:linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%)]" />
                          <div className="absolute -right-8 -top-8 h-56 w-56 rounded-full bg-purple-500/15 blur-[80px]" />
                        </div>
                      </div>
                      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
                      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 backdrop-blur" />
                      <div className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5" />
                    </div>
                  ) : null}

                  {item.level === "Level 3" ? (
                    <div className="pointer-events-none absolute inset-0">
                      {/* Code editor / tech delivery */}
                      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_30%_20%,rgba(14,165,233,0.16),transparent_55%),radial-gradient(700px_circle_at_70%_70%,rgba(99,102,241,0.14),transparent_60%)]" />
                      <div className="absolute left-5 top-6 right-5 h-44 rounded-2xl border border-white/10 bg-black/35 backdrop-blur-sm">
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
                          <span className="h-2 w-2 rounded-full bg-red-400/70" />
                          <span className="h-2 w-2 rounded-full bg-amber-400/70" />
                          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
                          <span className="ml-2 text-[11px] text-slate-400">code_delivery.ts</span>
                        </div>
                        <div className="p-4 font-mono text-[11px] leading-5 text-slate-300">
                          <div>
                            <span className="text-sky-300">export</span> <span className="text-indigo-200">async</span> <span className="text-slate-100">function</span>{" "}
                            <span className="text-amber-200">deliver</span>() {"{"}
                          </div>
                          <div className="pl-4 text-slate-300">
                            <span className="text-purple-200">return</span> <span className="text-slate-100">"Agent + 私有化部署"</span>;
                          </div>
                          <div className="text-slate-300">{"}"}{"}"}</div>
                        </div>
                      </div>
                      <div className="absolute -left-10 -bottom-10 h-56 w-56 rounded-full bg-sky-500/10 blur-[90px]" />
                    </div>
                  ) : null}

                  {/* Content */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold ${a.pill}`}>
                        <Icon className={`h-4 w-4 ${a.icon}`} />
                        {item.level}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500">点击进入</div>
                    </div>

                    <div className="mt-5 text-xl font-extrabold tracking-tight text-white">
                      {item.title}
                    </div>
                    <div className="mt-2 text-sm font-medium text-slate-200">
                      {item.description}
                    </div>
                    <div className="mt-4 text-sm leading-6 text-slate-400">
                      {item.examples}
                    </div>

                    <div className="mt-7 inline-flex items-center text-sm font-semibold text-brand-action">
                      立即浏览
                      <svg
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Glow corner */}
                  <div className={`pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/5 blur-3xl transition-colors ${a.deco}`} />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
