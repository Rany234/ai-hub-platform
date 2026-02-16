import Link from "next/link";
import { 
  Users, 
  Code2, 
  Flame, 
  ArrowRight, 
  Database, 
  GitFork, 
  PieChart, 
  Unlock,
  Wallet,
  ShoppingBag,
  HelpCircle,
  PlusCircle,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* --- Floor 0: Hero Section (Dual Identity Split) --- */}
      <section className="relative border-b border-white/5 overflow-hidden">
        <div className="flex flex-col md:flex-row min-h-[500px]">
          {/* Left: Demand Side */}
          <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 hover:bg-blue-500/5 transition-colors group">
            <div className="mb-6 w-fit p-3 rounded-2xl bg-blue-500/10 text-blue-400">
              <Users className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">我有需求 (Employer)</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              发布“半开源”悬赏，以传统外包 <span className="text-blue-400 font-bold">50% 的成本</span> 获取高质量 AI 解决方案。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-blue-500/20">
                <Link href="/dashboard/jobs/new">
                  <PlusCircle className="mr-2 h-5 w-5" /> 发布悬赏
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-14 px-8 rounded-2xl text-slate-300 hover:bg-white/5">
                <Link href="/dashboard/jobs">查看大厅 →</Link>
              </Button>
            </div>
          </div>

          {/* Right: Supply Side */}
          <div className="flex-1 p-8 lg:p-16 flex flex-col justify-center hover:bg-purple-500/5 transition-colors group">
            <div className="mb-6 w-fit p-3 rounded-2xl bg-purple-500/10 text-purple-400">
              <Code2 className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold mb-4">我有能力 (Creator)</h2>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              将代码沉淀为资产。一次开发，后续被任何人引用即可 <span className="text-purple-400 font-bold">永久赚取版税</span>。
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-14 px-8 rounded-2xl shadow-xl shadow-purple-500/20">
                <Link href="/dashboard/workbench">
                  <Database className="mr-2 h-5 w-5" /> 上架资产
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="h-14 px-8 rounded-2xl text-slate-300 hover:bg-white/5">
                <Link href="/listings">浏览资产库 →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* --- Floor 1: Bounty Hall (Live Data List) --- */}
      <section className="py-20 border-b border-white/5">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-brand-action font-bold text-sm uppercase tracking-wider mb-2">
                <Flame className="h-4 w-4 fill-brand-action" /> 正在进行的悬赏
              </div>
              <h3 className="text-3xl font-extrabold tracking-tight">接单赚钱 (Earn Money)</h3>
              <p className="text-slate-500 mt-2">解决真实业务问题，围观他人的需求演化。</p>
            </div>
            <Link href="/dashboard/jobs" className="text-sm font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              查看全部 50+ 悬赏 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-[10px] uppercase font-bold tracking-widest text-slate-500">
                    <th className="px-6 py-4">需求描述</th>
                    <th className="px-6 py-4">预算</th>
                    <th className="px-6 py-4">状态</th>
                    <th className="px-6 py-4 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[
                    { title: "DeepSeek R1 知识库对接", price: "¥2,000", status: "竞标中", type: "bidding" },
                    { title: "ComfyUI 电商工作流优化", price: "¥500", status: "竞标中", type: "bidding" },
                    { title: "企业级 Agent 权限管理系统", price: "¥5,000", status: "交付中", type: "progress" },
                    { title: "Midjourney 风格微调 Lora", price: "¥800", status: "已达成", type: "done" },
                  ].map((job, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="font-bold text-slate-200 group-hover:text-brand-action transition-colors">{job.title}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-brand-action font-black tracking-tight">{job.price}</div>
                      </td>
                      <td className="px-6 py-5">
                        <Badge variant="outline" className={job.type === 'bidding' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-500/10 text-slate-400 border-white/10"}>
                          {job.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button size="sm" variant={job.type === 'bidding' ? "default" : "secondary"} className="h-8 rounded-lg font-bold">
                          {job.type === 'bidding' ? "我要接单" : "围观"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --- Floor 2: Atomic Asset Library --- */}
      <section className="py-24 border-b border-white/5 bg-slate-950/50">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12">
            <h3 className="text-3xl font-extrabold tracking-tight">现成资产库 (Save Time)</h3>
            <p className="text-slate-500 mt-2">不要重复造轮子。直接购买原子资产，基于它进行二创 (Remix)。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "DeepSeek 提示词精选", type: "Prompt", icon: <Zap className="h-5 w-5" /> },
              { name: "Next.js 认证套件", type: "Script", icon: <Unlock className="h-5 w-5" /> },
              { name: "RAG 知识库架构", type: "Schema", icon: <Database className="h-5 w-5" /> },
              { name: "法律助手微调模型", type: "Model", icon: <Code2 className="h-5 w-5" /> },
            ].map((asset, i) => (
              <Link key={i} href="/listings" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-brand-action/50 transition-all hover:-translate-y-1">
                <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit text-slate-400 group-hover:text-brand-action transition-colors">
                  {asset.icon}
                </div>
                <h4 className="font-bold text-slate-200 mb-1">{asset.name}</h4>
                <div className="text-xs text-slate-500 mb-4">{asset.type}</div>
                <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 ring-1 ring-emerald-500/20">
                  ♻️ 引用分红: 10%
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- Floor 3: Core Mechanisms (The "Why") --- */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-extrabold tracking-tight">为什么选择 AI-Hub？</h3>
            <p className="text-slate-500 mt-2">重新定义协作与收入的底层逻辑。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 text-center">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit">
                <GitFork className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold mb-4">资产族谱</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                你的代码会被追踪。如果张三引用了你的代码，张三赚钱，你也分钱。每一份贡献都有据可查。
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 text-center">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-blue-500/10 text-blue-400 w-fit">
                <PieChart className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold mb-4">自动分账</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                没有冗长的账期。交易一结束，系统自动按协议比例将款项划入你的钱包 (Wallet)，即刻提现。
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/5 text-center">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 text-amber-400 w-fit">
                <Unlock className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-bold mb-4">半开源模式</h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                甲方以极低的价格“租用”成熟方案，乙方保留版权并通过多次授权赚取长线收益，实现双赢。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer: Functional Links --- */}
      <footer className="border-t border-white/5 bg-slate-950 pt-20 pb-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-xl font-black tracking-tighter text-white uppercase mb-4">AI-Hub</div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                让代码资产化，让创造可持续。全球首个基于 Remix 协议的 AI 资产演化网络。
              </p>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">快捷导航</h5>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="/dashboard/wallet" className="hover:text-white flex items-center gap-2"><Wallet className="h-4 w-4" /> 我的钱包</Link></li>
                <li><Link href="/dashboard/orders" className="hover:text-white flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> 我的订单</Link></li>
                <li><Link href="/help" className="hover:text-white flex items-center gap-2"><HelpCircle className="h-4 w-4" /> 帮助中心</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">法律政策</h5>
              <ul className="space-y-4 text-sm font-medium text-slate-500">
                <li><Link href="/terms" className="hover:text-white">服务协议</Link></li>
                <li><Link href="/privacy" className="hover:text-white">隐私条款</Link></li>
                <li><Link href="/manifesto" className="hover:text-white">共生宣言</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-600">
            <div>© {new Date().getFullYear()} AI-Hub. 沪ICP备 XXXXXXXX号</div>
            <div>让价值在每一行代码中持续进化</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
