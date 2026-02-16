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
  Zap,
  CheckCircle2,
  Search,
  MessageSquare,
  Boxes,
  Cpu,
  LayoutGrid
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { auth } from "@/auth";
import { getJobs } from "@/app/actions/job";

export default async function HomePage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const jobs = await getJobs();

  // Mock counts for dashboard (replace with real logic if available)
  const dashboardStats = {
    balance: "¥1,200.00",
    activeOrders: 3,
    unreadMessages: 5
  };

  const categories = [
    { name: "提示词", icon: <Zap className="h-5 w-5" />, slug: "prompt" },
    { name: "智能体", icon: <Cpu className="h-5 w-5" />, slug: "agent" },
    { name: "代码脚本", icon: <Code2 className="h-5 w-5" />, slug: "code" },
    { name: "工作流", icon: <GitFork className="h-5 w-5" />, slug: "workflow" },
    { name: "行业方案", icon: <Boxes className="h-5 w-5" />, slug: "solution" },
    { name: "全部", icon: <LayoutGrid className="h-5 w-5" />, slug: "all" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* --- 第 0 层: Hero Section --- */}
      <section className="relative border-b border-white/5 overflow-hidden">
        {isLoggedIn ? (
          /* 已登录: 快捷仪表盘 */
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black tracking-tight text-white mb-2">
                    欢迎回来，{session.user?.name || "开发者"}
                  </h1>
                  <p className="text-slate-400 font-medium">今天想开启什么新任务？</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button asChild className="bg-blue-600 hover:bg-blue-500 rounded-xl font-bold">
                    <Link href="/dashboard/jobs/new"><PlusCircle className="mr-2 h-4 w-4" /> 发布新需求</Link>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/wallet" className="group p-6 rounded-[2rem] border border-white/10 bg-slate-950/40 hover:bg-slate-950 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                      <Wallet className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                      钱包余额
                    </Badge>
                  </div>
                  <div className="text-3xl font-black text-white group-hover:text-emerald-400 transition-colors">{dashboardStats.balance}</div>
                </Link>

                <Link href="/dashboard/orders" className="group p-6 rounded-[2rem] border border-white/10 bg-slate-950/40 hover:bg-slate-950 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                      活跃订单
                    </Badge>
                  </div>
                  <div className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors">{dashboardStats.activeOrders} <span className="text-sm font-medium text-slate-500 italic ml-1">个进行中</span></div>
                </Link>

                <Link href="/dashboard/chat" className="group p-6 rounded-[2rem] border border-white/10 bg-slate-950/40 hover:bg-slate-950 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                      未读消息
                    </Badge>
                  </div>
                  <div className="text-3xl font-black text-white group-hover:text-purple-400 transition-colors">{dashboardStats.unreadMessages} <span className="text-sm font-medium text-slate-500 italic ml-1">条新通知</span></div>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* 未登录: 营销分屏 */
          <div className="flex flex-col md:flex-row min-h-[420px]">
            {/* 左侧: 需求方 (雇主) */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 hover:bg-blue-600/[0.03] transition-all group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mb-4 w-fit p-3 rounded-2xl bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <Users className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black mb-3 tracking-tight">我有需求</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed font-medium">
                  发布“半开源”悬赏，以传统开发 <span className="text-blue-400 font-bold">50% 的成本</span> 快速获取 AI 解决方案。
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                    <Link href="/dashboard/jobs/new">
                      <PlusCircle className="mr-2 h-5 w-5" /> 发布悬赏
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* 右侧: 供给方 (创作者) */}
            <div className="flex-1 p-8 lg:p-10 flex flex-col justify-center hover:bg-purple-600/[0.03] transition-all group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="mb-4 w-fit p-3 rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-purple-500/20">
                  <Code2 className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black mb-3 tracking-tight">我有能力</h2>
                <p className="text-slate-400 text-lg mb-8 max-w-md leading-relaxed font-medium">
                  一次开发，终身受益。您的代码被他人引用即可自动触发协议，<span className="text-purple-400 font-bold">永久赚取版税</span>。
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-500 text-white font-bold h-12 px-8 rounded-xl shadow-2xl shadow-purple-600/20 active:scale-95 transition-all">
                    <Link href="/dashboard/workbench">
                      <Database className="mr-2 h-5 w-5" /> 上架资产
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 全局搜索条 - 位于 Hero 下方或中间 */}
        <div className="relative z-20 -mt-8 pb-12">
          <div className="mx-auto max-w-3xl px-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/20 blur-2xl group-hover:bg-blue-600/30 transition-all opacity-50" />
              <div className="relative flex items-center bg-slate-950 border border-white/10 rounded-2xl p-1 shadow-2xl focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                <div className="pl-4 text-slate-500">
                  <Search className="h-5 w-5" />
                </div>
                <Input 
                  className="bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-slate-600 h-14 text-lg" 
                  placeholder="搜索 AI 模型、提示词、工作流或任务..." 
                />
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl mr-1">
                  搜索
                </Button>
              </div>
            </div>

            {/* 类别导航 Icon Grid */}
            <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-4">
              {categories.map((cat, i) => (
                <Link 
                  key={i} 
                  href={cat.slug === 'all' ? '/listings' : `/listings?category=${cat.slug}`}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white/5 transition-colors group"
                >
                  <div className="p-3 rounded-xl bg-slate-800 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-white transition-colors tracking-widest">{cat.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 第 1 层: 任务大厅 (Bounty Hall) --- */}
      <section className="py-24 border-b border-white/5 bg-slate-900/50">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-brand-action font-bold text-sm uppercase tracking-widest mb-3">
                <Flame className="h-4 w-4 fill-brand-action" /> 实时需求广场
              </div>
              <h3 className="text-3xl font-black tracking-tight text-white">任务大厅</h3>
              <p className="text-slate-500 mt-3 text-lg font-medium">参与企业级 AI 项目，每一次交付都是一个新资产的起点。</p>
            </div>
            <Button asChild variant="link" className="text-slate-400 hover:text-white p-0 h-auto font-bold">
              <Link href="/dashboard/jobs" className="flex items-center gap-1">
                查看全部活跃任务 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02] text-[11px] uppercase font-black tracking-widest text-slate-500">
                    <th className="px-8 py-5">项目描述</th>
                    <th className="px-8 py-5">悬赏预算</th>
                    <th className="px-8 py-5">当前进度</th>
                    <th className="px-8 py-5 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {jobs.length > 0 ? (
                    jobs.slice(0, 5).map((job: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-6">
                          <div className="font-extrabold text-slate-200 text-lg group-hover:text-brand-action transition-colors truncate max-w-md">{job.title}</div>
                          {job.profiles && (
                            <div className="text-xs text-slate-500 mt-1 font-bold">发布人: {job.profiles.username}</div>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-brand-action font-black text-xl tracking-tighter">¥{job.budget || job.price}</div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge variant="outline" className={job.status === 'open' || job.status === '竞标中' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-3 py-1 font-bold" : "bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1 font-bold"}>
                            {job.status === 'open' ? '竞标中' : (job.status === 'in_progress' ? '进行中' : job.status)}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <Button asChild size="sm" variant={job.status === 'open' || job.status === '竞标中' ? "default" : "secondary"} className="h-10 px-6 rounded-xl font-black">
                            <Link href={`/dashboard/jobs/${job.id}`}>
                              {job.status === 'open' || job.status === '竞标中' ? "我要接单" : "详情围观"}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-12 text-center text-slate-500 font-bold">
                        当前暂无公开悬赏任务
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* --- 第 2 层: 资产库 --- */}
      <section className="py-24 border-b border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-14">
            <h3 className="text-3xl font-black tracking-tight text-white">资产库</h3>
            <p className="text-slate-500 mt-3 text-lg font-medium">不要重复造轮子。直接购买基础单元，基于它们进行“派生” (Remix)。</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "DeepSeek 优化提示词", type: "Prompt", icon: <Zap className="h-5 w-5" /> },
              { name: "Next.js 高级认证组件", type: "代码/脚本", icon: <Unlock className="h-5 w-5" /> },
              { name: "RAG 向量知识库架构", type: "系统架构", icon: <Database className="h-5 w-5" /> },
              { name: "垂直行业微调模型", type: "模型文件", icon: <Code2 className="h-5 w-5" /> },
            ].map((asset, i) => (
              <Link key={i} href="/listings" className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/40 p-8 hover:border-brand-action/50 transition-all hover:-translate-y-2 shadow-xl">
                <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit text-slate-400 group-hover:text-brand-action group-hover:scale-110 transition-all">
                  {asset.icon}
                </div>
                <h4 className="font-black text-slate-100 text-lg mb-2">{asset.name}</h4>
                <div className="text-xs font-bold text-slate-500 mb-6 uppercase tracking-widest">{asset.type}</div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-1.5 text-[11px] font-black text-emerald-400 ring-1 ring-emerald-500/20 uppercase tracking-tight">
                  <GitFork className="h-3 w-3" /> 引用分红: 10%
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 第 3 层: 核心机制教学 --- */}
      <section className="py-24 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-black tracking-tight text-white mb-4">为什么选择 AI-Hub？</h3>
            <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">不仅仅是交易，更是重新定义了代码资产的商业价值。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors shadow-2xl">
              <div className="mx-auto mb-8 p-5 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit ring-1 ring-emerald-500/20">
                <GitFork className="h-10 w-10" />
              </div>
              <h4 className="text-2xl font-black mb-4">族谱</h4>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                代码不再是孤岛。通过族谱追踪每一次引用，当有人基于您的成果赚钱时，系统会自动为您分配版税。
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors shadow-2xl">
              <div className="mx-auto mb-8 p-5 rounded-2xl bg-blue-500/10 text-blue-400 w-fit ring-1 ring-blue-500/20">
                <PieChart className="h-10 w-10" />
              </div>
              <h4 className="text-2xl font-black mb-4">自动分账</h4>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                抛弃传统账期。每一笔交易完成后，系统将根据分账协议瞬间完成资金清算，钱直接进您的个人钱包。
              </p>
            </div>

            <div className="p-10 rounded-[2.5rem] border border-white/5 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors shadow-2xl">
              <div className="mx-auto mb-8 p-5 rounded-2xl bg-amber-500/10 text-amber-400 w-fit ring-1 ring-amber-500/20">
                <Unlock className="h-10 w-10" />
              </div>
              <h4 className="text-2xl font-black mb-4">半开源模式</h4>
              <p className="text-slate-400 text-base leading-relaxed font-medium">
                甲方以极致低价租用方案解决痛点，乙方保留核心版权通过规模化授权获利。这是属于 AI 时代的双赢。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 第 4 层: 实时动态 --- */}
      <div className="py-8 bg-slate-950">
        <LiveActivityTicker />
      </div>

      {/* --- 页脚 --- */}
      <footer className="border-t border-white/5 bg-slate-950 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-black tracking-tighter text-white uppercase mb-6 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 fill-white" />
                </div>
                AI-Hub
              </div>
              <p className="text-base text-slate-500 leading-relaxed max-w-sm font-medium">
                让代码资产化，让创造可持续。全球首个基于“半开源”协议的 AI 资产演化网络。
              </p>
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">我的中心</h5>
              <ul className="space-y-5 text-sm font-bold text-slate-500">
                <li><Link href="/dashboard/wallet" className="hover:text-white flex items-center gap-3 transition-all group"><Wallet className="h-4 w-4 group-hover:text-brand-action" /> 我的钱包</Link></li>
                <li><Link href="/dashboard/orders" className="hover:text-white flex items-center gap-3 transition-all group"><ShoppingBag className="h-4 w-4 group-hover:text-brand-action" /> 我的订单</Link></li>
                <li><Link href="/help" className="hover:text-white flex items-center gap-3 transition-all group"><HelpCircle className="h-4 w-4 group-hover:text-brand-action" /> 帮助中心</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-8">协议规则</h5>
              <ul className="space-y-5 text-sm font-bold text-slate-500">
                <li><Link href="/manifesto" className="hover:text-white transition-colors">共生宣言</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">服务协议</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">隐私条款</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              © {new Date().getFullYear()} AI-Hub. 沪ICP备 XXXXXXXX号
            </div>
            <div className="text-slate-500">让每一行代码都在资产网络中持续进化</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

