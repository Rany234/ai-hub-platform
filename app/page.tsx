import Link from "next/link";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { 
  Terminal, 
  Zap, 
  GitFork, 
  Search, 
  PlusCircle, 
  ShieldCheck, 
  Database,
  ArrowRight,
  TrendingUp,
  Cpu
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-purple-500/30 font-sans">
      {/* --- Section 1: Hero (Clean & Tech-Heavy) --- */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_10%_20%,rgba(124,58,237,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-16 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: Text Content */}
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-400 backdrop-blur-md">
                <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
                AI-Hub Protocol v2.0
              </div>

              <h1 className="mt-6 text-5xl font-extrabold tracking-tight sm:text-6xl text-slate-100">
                构建你的 <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">AI 资产组合</span>
              </h1>

              <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
                从发布悬赏到收取版税，这是开发者的价值放大器。将每一次交付转化为持续增值的代码遗产。
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-100 px-6 text-sm font-bold text-slate-950 transition-all hover:bg-white active:scale-95 shadow-lg shadow-white/5"
                >
                  立即入驻
                </Link>
                <Link
                  href="/listings"
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 text-sm font-bold text-slate-200 transition-all hover:bg-white/10 active:scale-95 backdrop-blur-sm"
                >
                  探索资产
                </Link>
              </div>
            </div>

            {/* Right: CSS Code Terminal */}
            <div className="relative w-full max-w-lg lg:max-w-md">
              <div className="absolute -inset-4 bg-purple-500/20 blur-3xl opacity-50 rounded-full" />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-500/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500/40" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">protocol_main.ts</div>
                </div>
                <div className="p-6 font-mono text-sm leading-relaxed min-h-[200px]">
                  <div className="flex gap-3">
                    <span className="text-slate-600 select-none">1</span>
                    <p className="text-slate-300">
                      <span className="text-purple-400">import</span> {"{ Asset }"} <span className="text-purple-400">from</span> <span className="text-emerald-400">'ai-hub'</span>;
                    </p>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-slate-600 select-none">2</span>
                    <p className="text-slate-300">
                      <span className="text-slate-500">// Value +10.00%</span>
                    </p>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-slate-600 select-none">3</span>
                    <p className="text-slate-300">
                      <span className="text-purple-400">const</span> lineage = Asset.<span className="text-blue-400">trace</span>(id);
                    </p>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <span className="text-slate-600 select-none">4</span>
                    <p className="text-slate-300">
                      lineage.<span className="text-blue-400">remix</span>({"{ royalty: 0.1 }"});
                    </p>
                  </div>
                  <div className="mt-4 flex animate-pulse">
                    <div className="h-4 w-2 bg-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: Bento Grid (The Innovation) --- */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Bounty Hall (Span 2) */}
          <Link href="/dashboard/jobs" className="md:col-span-2 group">
            <div className="h-full rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-8 transition-all hover:border-purple-500/30">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                    <PlusCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">悬赏大厅 (Bounty Hall)</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-600 group-hover:translate-x-1 transition-transform" />
              </div>
              <div className="space-y-4">
                {[
                  { title: "DeepSeek 接入 RAG 知识库", price: "¥500", status: "招标中" },
                  { title: "ComfyUI 电商工作流优化", price: "¥1200", status: "进行中" },
                  { title: "自定义 Agent 角色设定", price: "¥300", status: "招标中" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                    <span className="text-sm font-medium text-slate-300">{item.title}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-brand-action">{item.price}</span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-white/5 px-2 py-1 rounded-md">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Link>

          {/* Card 2: Smart Split (Span 1) */}
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="h-24 w-24" />
            </div>
            <div className="relative z-10">
              <div className="p-2 w-fit rounded-lg bg-blue-500/10 text-blue-400 mb-6">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">智能合约</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Smart Split Protocol</p>
              
              <div className="space-y-6">
                <div className="relative h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="absolute inset-y-0 left-0 bg-blue-500 w-[90%]" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-black text-slate-100 tracking-tighter">90%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Creator Share</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-slate-400">10%</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-1">Protocol</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Genealogy (Span 1) */}
          <Link href="/listings" className="group">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/[0.07] relative overflow-hidden">
              <div className="p-2 w-fit rounded-lg bg-emerald-500/10 text-emerald-400 mb-6">
                <GitFork className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-bold mb-2">资产谱系</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium">Genealogy Tree</p>
              
              <div className="flex justify-center py-4">
                <div className="relative">
                  <div className="h-8 w-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center relative z-10">
                    <div className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-emerald-500/50 to-transparent" />
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 w-16 h-px bg-emerald-500/30" />
                  <div className="absolute top-12 -left-4 h-4 w-px bg-emerald-500/30" />
                  <div className="absolute top-12 right-[-16px] h-4 w-px bg-emerald-500/30" />
                </div>
              </div>
              <div className="mt-8 text-center">
                <span className="text-[10px] text-emerald-400/80 font-bold uppercase tracking-widest">追踪每一份衍生价值</span>
              </div>
            </div>
          </Link>

          {/* Card 4: Atomic Assets (Span 2) */}
          <Link href="/listings" className="md:col-span-2 group">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/[0.07] relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                    <Database className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold">原子资产库 (Atomic Assets)</h3>
                </div>
                <div className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-md uppercase tracking-tighter">120+ Assets Online</div>
              </div>
              
              <div className="flex gap-4 overflow-hidden mask-fade-right">
                {[
                  { name: "DeepSeek Prompts", icon: <Zap className="h-4 w-4" /> },
                  { name: "Auth Kit v1.2", icon: <Cpu className="h-4 w-4" /> },
                  { name: "RAG Schema", icon: <Search className="h-4 w-4" /> },
                  { name: "Agent Blueprint", icon: <Terminal className="h-4 w-4" /> },
                ].map((asset, i) => (
                  <div key={i} className="min-w-[160px] p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="p-2 rounded-lg bg-white/5 w-fit text-slate-400">
                      {asset.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-300">{asset.name}</span>
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest">Remixable</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* --- Section 3: Live Ticker (Marketplace Feel) --- */}
      <div className="mt-12">
        <LiveActivityTicker />
      </div>

      {/* --- Footer --- */}
      <footer className="border-t border-white/5 bg-slate-950 pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-start justify-between gap-12 lg:flex-row">
            <div className="max-w-sm">
              <div className="text-xl font-black tracking-tighter text-slate-100 uppercase">AI-Hub</div>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">
                智汇 AI-Hub 是代码资产演化网络。我们通过发布悬赏与 Remix 协议，将传统外包转变为可持续增值的数字资产。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-16 sm:grid-cols-3">
              <div className="space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">产品</div>
                <ul className="space-y-2 text-sm font-medium text-slate-500">
                  <li><Link href="/listings" className="hover:text-slate-300">资产市场</Link></li>
                  <li><Link href="/dashboard/jobs" className="hover:text-slate-300">悬赏大厅</Link></li>
                  <li><Link href="/dashboard/workbench" className="hover:text-slate-300">我的工作台</Link></li>
                </ul>
              </div>
              <div className="space-y-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">协议</div>
                <ul className="space-y-2 text-sm font-medium text-slate-500">
                  <li><Link href="/manifesto" className="hover:text-slate-300">共生宣言</Link></li>
                  <li><Link href="/docs/royalty" className="hover:text-slate-300">版税机制</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-white/5 pt-8 text-[9px] font-bold uppercase tracking-widest text-slate-700 sm:flex-row">
            <div>© {new Date().getFullYear()} AI-Hub. </div>
            <div className="flex gap-8">
              <Link href="/privacy" className="hover:text-slate-500 transition-colors">隐私条款</Link>
              <Link href="/terms" className="hover:text-slate-500 transition-colors">服务协议</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
