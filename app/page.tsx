import Link from "next/link";
import { ServiceMatrix } from "@/components/home/ServiceMatrix";
import { TrustProcess } from "@/components/home/TrustProcess";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { Sparkles, Zap, ShieldCheck, GitFork, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      {/* --- Section 1: Hero (The High-End Vision) --- */}
      <section className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32">
        {/* 背景光效 - 还原紫色/蓝色梦幻感 */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_20%,rgba(124,58,237,0.25),transparent_55%),radial-gradient(900px_circle_at_80%_35%,rgba(59,130,246,0.25),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.1),rgba(2,6,23,0.95))]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start gap-12 lg:flex-row lg:items-center lg:justify-between">
            {/* 左侧文字文案 */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-bold text-purple-300 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                智汇 AI-Hub：让代码进化的资产交易网络
              </div>

              <h1 className="mt-8 text-5xl font-extrabold tracking-tight sm:text-7xl">
                <span className="block text-white">连接需求与创造</span>
                <span className="mt-2 block bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  让代码成为数字资产
                </span>
              </h1>

              <p className="mt-6 text-lg leading-relaxed text-slate-400 sm:text-xl font-medium">
                发布悬赏积累资产，或 Remix 他人成果赚取版税。
                这里不只是交付任务，更是代码资产的演化广场。
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/login"
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-white px-8 text-base font-bold text-slate-950 shadow-2xl shadow-white/10 transition-all hover:bg-slate-100 hover:scale-[1.02] active:scale-95"
                >
                  立即入驻
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 text-base font-bold text-slate-200 backdrop-blur-md transition-all hover:bg-white/10 hover:scale-[1.02] active:scale-95"
                >
                  寻找资产
                </Link>
              </div>
            </div>

            {/* 右侧漂浮玻璃卡片 (微细节还原) */}
            <div className="relative w-full max-w-lg perspective-1000 lg:max-w-xl">
              <div className="relative animate-float-slow overflow-hidden rounded-[2.5rem] border border-white/15 bg-white/5 p-8 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
                <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
                <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />

                <div className="relative">
                  <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500/50" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/50" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <div className="rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                      Asset_Lineage.ts
                    </div>
                  </div>

                  <div className="mt-8 space-y-6 font-mono text-sm leading-relaxed">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                        <Zap className="h-3.5 w-3.5" />
                      </div>
                      <code className="text-slate-300">
                        <span className="text-purple-400">import</span> {"{ DeepSeek }"} <span className="text-purple-400">from</span> <span className="text-emerald-400">'ai-hub/assets'</span>
                      </code>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400">
                        <GitFork className="h-3.5 w-3.5" />
                      </div>
                      <code className="text-slate-300">
                        <span className="text-purple-400">const</span> myAgent = <span className="text-blue-400">Remix</span>(DeepSeek, {"{ customData }"})
                      </code>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </div>
                      <code className="text-emerald-400/80 italic">// 资产确权：协议自动结算版税</code>
                    </div>
                  </div>

                  <div className="mt-10 flex items-center justify-between rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 p-0.5">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900 text-xs font-bold">
                          AI
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">智能体蓝图 (Blueprint)</div>
                        <div className="text-[10px] text-slate-500">所有权：智汇社区</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2 py-1 text-[10px] font-extrabold text-emerald-400 ring-1 ring-emerald-500/20 uppercase tracking-tight">
                      <Zap className="h-3 w-3 fill-emerald-400" />
                      Remixable
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Product Levels (The 3-Level Breakdown) --- */}
      <div className="relative py-24 bg-slate-950/50">
        <ServiceMatrix />
      </div>

      {/* --- Section 3: Process (Automated Economy) --- */}
      <div className="relative py-24 border-t border-white/5">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">资产进化流程</h2>
              <p className="mt-4 text-lg text-slate-400">不仅仅是交易，更是资产的全生命周期管理。</p>
            </div>
            <Link href="/manifesto" className="group flex items-center gap-2 text-sm font-bold text-purple-400 hover:text-purple-300">
              了解共生经济协议 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <TrustProcess />
        </div>
      </div>

      {/* --- Section 4: Live Ticker (Real Social Proof) --- */}
      <div className="mt-12">
        <LiveActivityTicker />
      </div>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 bg-slate-950 pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-12 lg:flex-row">
            <div className="max-w-sm">
              <div className="text-xl font-black tracking-tighter text-white uppercase">AI-Hub</div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                智汇 AI-Hub 是全球领先的代码资产演化网络。我们通过发布悬赏与 Remix 协议，将传统的外包交付转变为可持续增值的数字资产。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16 sm:grid-cols-3">
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">产品</div>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li><Link href="/listings" className="hover:text-white transition-colors">资产市场</Link></li>
                  <li><Link href="/dashboard/jobs" className="hover:text-white transition-colors">悬赏大厅</Link></li>
                  <li><Link href="/dashboard/workbench" className="hover:text-white transition-colors">我的工作台</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-widest text-slate-400">协议</div>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li><Link href="/manifesto" className="hover:text-white transition-colors">共生宣言</Link></li>
                  <li><Link href="/docs/royalty" className="hover:text-white transition-colors">版税机制</Link></li>
                  <li><Link href="/docs/remix" className="hover:text-white transition-colors">Remix 指南</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 text-[10px] font-bold uppercase tracking-widest text-slate-600 sm:flex-row">
            <div>© {new Date().getFullYear()} AI-Hub. 让价值持续进化</div>
            <div className="flex gap-8">
              <span>沪ICP备 XXXXXXXX号</span>
              <Link href="/privacy" className="hover:text-slate-400">隐私条款</Link>
              <Link href="/terms" className="hover:text-slate-400">服务协议</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
