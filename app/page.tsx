import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  Flame,
  GitFork,
  LayoutGrid,
  MessageSquare,
  PieChart,
  PlusCircle,
  Search,
  ShoppingBag,
  Unlock,
  Users,
  Wallet,
  Zap,
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
  const jobsData = await getJobs();

  // Seed Data Fallback for Bounty Hall
  const jobs = jobsData.length > 0 ? jobsData : [
    {
      id: "seed-1",
      title: "企业级知识库 RAG 架构优化 (DeepSeek-V3)",
      budget: 3500,
      status: "open",
      profiles: { username: "AI_Architect" },
      isHot: true,
    },
    {
      id: "seed-2",
      title: "定制化 ComfyUI 电商海报自动生成工作流",
      budget: 1200,
      status: "open",
      profiles: { username: "Workflow_Master" },
      isNew: true,
    },
    {
      id: "seed-3",
      title: "多模态法律合同审查 Agent 开发",
      budget: 5000,
      status: "in_progress",
      profiles: { username: "LegalTech_Lab" },
    },
    {
      id: "seed-4",
      title: "微信小程序 AI 客服插件对接 (含流式响应)",
      budget: 800,
      status: "open",
      profiles: { username: "FastDev" },
      isNew: true,
    },
    {
      id: "seed-5",
      title: "企业 Agent 权限管理模块 + 审计日志",
      budget: 4200,
      status: "open",
      profiles: { username: "EnterpriseOps" },
      isHot: true,
    },
    {
      id: "seed-6",
      title: "Prompt 版本管理 + A/B 测试控制台",
      budget: 1600,
      status: "open",
      profiles: { username: "PromptLab" },
    },
    {
      id: "seed-7",
      title: "私有化部署：向量库 + 监控告警 (Prometheus)",
      budget: 6800,
      status: "in_progress",
      profiles: { username: "InfraTeam" },
    },
    {
      id: "seed-8",
      title: "代码脚本：批量清洗 Excel + 字段映射生成器",
      budget: 900,
      status: "open",
      profiles: { username: "DataTools" },
    },
  ];

  // Featured Creators Data
  const featuredCreators = [
    {
      name: "张小刚",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      badge: "Top 1% 开发者",
      sales: "1.2k+",
    },
    {
      name: "Li Wei",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
      badge: "Prompt 专家",
      sales: "800+",
    },
    {
      name: "Sarah J.",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      badge: "工作流大师",
      sales: "2.5k+",
    },
    {
      name: "陈老师",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Brian",
      badge: "企业方案专家",
      sales: "500+",
    },
  ];

  // Mock counts for dashboard
  const dashboardStats = {
    balance: "¥1,200.00",
    activeOrders: 3,
    unreadMessages: 5,
  };

  const portalCategories = [
    {
      name: "AI Agents",
      href: "/listings?category=agent",
      badge: "Hot",
    },
    {
      name: "Prompt Engineering",
      href: "/listings?category=prompt",
      badge: "New",
    },
    {
      name: "Code Scripts",
      href: "/listings?category=code",
    },
    {
      name: "Workflow",
      href: "/listings?category=workflow",
    },
    {
      name: "Industry Solutions",
      href: "/listings?category=solution",
    },
  ];

  const iconGridCategories = [
    { name: "提示词", icon: <Zap className="h-4 w-4" />, slug: "prompt" },
    { name: "智能体", icon: <Cpu className="h-4 w-4" />, slug: "agent" },
    { name: "代码脚本", icon: <Code2 className="h-4 w-4" />, slug: "code" },
    { name: "工作流", icon: <GitFork className="h-4 w-4" />, slug: "workflow" },
    { name: "行业方案", icon: <Boxes className="h-4 w-4" />, slug: "solution" },
    { name: "全部", icon: <LayoutGrid className="h-4 w-4" />, slug: "all" },
  ];

  const recentlyTraded = [
    { name: "RAG 架构模板", price: "¥199" },
    { name: "ComfyUI 海报流", price: "¥49" },
    { name: "企业 Agent 权限模块", price: "¥899" },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-blue-500/30 text-[85%]">
      {/* --- 第 0 层: 三栏门户 Hero (2:6:2) --- */}
      <section className="border-b border-white/10 bg-slate-900/60">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-4">
            {/* 左侧分类栏 */}
            <aside className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-xs font-black tracking-widest text-slate-400">
                分类导航
              </div>
              <div className="p-2">
                {portalCategories.map((c) => (
                  <Link
                    key={c.name}
                    href={c.href}
                    className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm font-bold text-slate-200">
                      {c.name}
                    </span>
                    {c.badge ? (
                      <span
                        className={
                          c.badge === "Hot"
                            ? "text-[10px] font-black text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full"
                            : "text-[10px] font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"
                        }
                      >
                        {c.badge}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </aside>

            {/* 中间主区 */}
            <div className="lg:col-span-6">
              {/* 搜索 */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-2 shadow-2xl">
                <div className="flex items-center gap-2">
                  <div className="pl-2 text-slate-500">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    className="bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-slate-600 h-10 text-sm"
                    placeholder="搜索 AI 资产、任务或服务..."
                  />
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white font-black h-9 px-6 rounded-xl">
                    搜索
                  </Button>
                </div>
                <div className="mt-2 flex items-center gap-2 px-2 text-xs font-bold">
                  <span className="text-slate-500">热搜：</span>
                  {["DeepSeek 提示词", "企业 Agent", "私人助理脚本"].map((tag) => (
                    <Link
                      key={tag}
                      href={`/listings?q=${tag}`}
                      className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>

              {/* 紧凑横幅 */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600/15 via-slate-950/40 to-purple-600/15 p-4 overflow-hidden relative">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(168,85,247,0.35),transparent_40%)]" />
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-white">
                      高密度门户模式 · Marketplace Portal
                    </div>
                    <div className="text-xs text-slate-400 font-medium mt-1">
                      搜索优先，分类直达，像“猪八戒”一样快找人/找方案。
                    </div>
                  </div>
                  <Button
                    asChild
                    size="sm"
                    className="bg-brand-action/90 hover:bg-brand-action text-slate-950 font-black rounded-xl"
                  >
                    <Link href="/dashboard/jobs/new">
                      <PlusCircle className="mr-2 h-4 w-4" /> 立即发布任务
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 小图标网格 */}
              <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-3">
                {iconGridCategories.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.slug === "all" ? "/listings" : `/listings?category=${cat.slug}`}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-white/10 bg-slate-950/30 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-slate-300">{cat.icon}</span>
                    <span className="text-xs font-black text-slate-200">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 右侧用户欢迎卡 */}
            <aside className="lg:col-span-2 rounded-2xl border border-white/10 bg-slate-950/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 text-xs font-black tracking-widest text-slate-400">
                用户中心
              </div>
              <div className="p-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 overflow-hidden" />
                      <div className="min-w-0">
                        <div className="text-sm font-black text-white truncate">
                          {session.user?.name || "开发者"}
                        </div>
                        <div className="text-xs text-slate-500 font-bold">
                          欢迎回来
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard/wallet"
                        className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-colors"
                      >
                        <div className="text-[10px] text-slate-500 font-black">
                          余额
                        </div>
                        <div className="text-sm font-black text-white">
                          {dashboardStats.balance}
                        </div>
                      </Link>
                      <Link
                        href="/dashboard/jobs"
                        className="rounded-xl border border-white/10 bg-white/5 p-2 hover:bg-white/10 transition-colors"
                      >
                        <div className="text-[10px] text-slate-500 font-black">
                          进行中
                        </div>
                        <div className="text-sm font-black text-white">
                          {dashboardStats.activeOrders} 单
                        </div>
                      </Link>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden">
                      <div className="px-3 py-2 border-b border-white/10 text-[10px] font-black text-slate-500 tracking-widest">
                        最近成交
                      </div>
                      <div className="px-3 py-2 space-y-2">
                        {recentlyTraded.map((t) => (
                          <div
                            key={t.name}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-300 font-bold truncate">
                              {t.name}
                            </span>
                            <span className="text-brand-action font-black">
                              {t.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        asChild
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl h-9 px-4"
                      >
                        <Link href="/dashboard">控制台</Link>
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        variant="secondary"
                        className="rounded-xl h-9 px-4 font-black"
                      >
                        <Link href="/dashboard/chat">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          消息
                        </Link>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-black text-white">
                      你好，欢迎来到 AI-Hub
                    </div>
                    <div className="text-xs text-slate-500 font-medium mt-1">
                      登录后可查看余额、订单和消息。
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Link
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-center font-black hover:bg-white/10 transition-colors"
                        href="/login"
                      >
                        登录
                      </Link>
                      <Link
                        className="rounded-xl bg-brand-action/90 hover:bg-brand-action text-slate-950 px-3 py-2 text-center font-black transition-colors"
                        href="/signup"
                      >
                        注册
                      </Link>
                    </div>

                    <div className="mt-3">
                      <Link
                        href="/dashboard/jobs/new"
                        className="text-xs font-black text-brand-action hover:text-brand-action/80 transition-colors"
                      >
                        快速入口：发布任务 →
                      </Link>
                    </div>

                    <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/40 overflow-hidden">
                      <div className="px-3 py-2 border-b border-white/10 text-[10px] font-black text-slate-500 tracking-widest">
                        最近成交
                      </div>
                      <div className="px-3 py-2 space-y-2">
                        {recentlyTraded.map((t) => (
                          <div
                            key={t.name}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-slate-300 font-bold truncate">
                              {t.name}
                            </span>
                            <span className="text-brand-action font-black">
                              {t.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* --- 第 1 层: 任务大厅 (Bounty Hall) --- */}
      <section className="py-16 border-b border-white/10 bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 text-brand-action font-black text-xs uppercase tracking-widest mb-2">
                <Flame className="h-3 w-3 fill-brand-action" /> 实时需求广场
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                任务大厅
              </h3>
              <p className="text-slate-500 mt-2 text-sm font-medium">
                高密度列表：更快浏览，更快接单。
              </p>
            </div>
            <Button
              asChild
              variant="link"
              className="text-slate-400 hover:text-white p-0 h-auto font-black"
            >
              <Link href="/dashboard/jobs" className="flex items-center gap-1">
                查看全部活跃任务 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-[10px] uppercase font-black tracking-widest text-slate-500">
                    <th className="px-5 py-3">项目描述</th>
                    <th className="px-5 py-3">预算</th>
                    <th className="px-5 py-3">进度</th>
                    <th className="px-5 py-3 text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {jobs.slice(0, 8).map((job: any) => (
                    <tr
                      key={job.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="font-extrabold text-slate-200 text-sm group-hover:text-brand-action transition-colors truncate max-w-[520px]">
                            {job.title}
                          </div>
                          {job.isHot ? (
                            <span className="text-[10px] font-black text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
                              Hot
                            </span>
                          ) : null}
                          {job.isNew ? (
                            <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              New
                            </span>
                          ) : null}
                        </div>
                        {job.profiles ? (
                          <div className="text-[10px] text-slate-500 mt-1 font-bold">
                            发布人: {job.profiles.username}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-brand-action font-black text-sm tracking-tight">
                          ¥{job.budget ?? job.price}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge
                          variant="outline"
                          className={
                            job.status === "open" || job.status === "竞标中"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 px-2 py-0.5 font-black text-[10px]"
                              : "bg-blue-500/10 text-blue-400 border-blue-500/30 px-2 py-0.5 font-black text-[10px]"
                          }
                        >
                          {job.status === "open"
                            ? "竞标中"
                            : job.status === "in_progress"
                              ? "进行中"
                              : job.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button
                          asChild
                          size="sm"
                          variant={
                            job.status === "open" || job.status === "竞标中"
                              ? "default"
                              : "secondary"
                          }
                          className="h-8 px-4 rounded-xl font-black text-xs"
                        >
                          <Link href={`/dashboard/jobs/${job.id}`}>
                            {job.status === "open" || job.status === "竞标中"
                              ? "我要接单"
                              : "详情"}
                          </Link>
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

      {/* --- 第 2 层: 资产库 --- */}
      <section className="py-16 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-8">
            <h3 className="text-2xl font-black tracking-tight text-white">
              资产库
            </h3>
            <p className="text-slate-500 mt-2 text-sm font-medium">
              更密集的 6 列网格，快速扫货。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "DeepSeek 优化提示词", type: "Prompt", icon: <Zap className="h-4 w-4" /> },
              { name: "Next.js 高级认证组件", type: "代码/脚本", icon: <Unlock className="h-4 w-4" /> },
              { name: "RAG 向量知识库架构", type: "系统架构", icon: <Database className="h-4 w-4" /> },
              { name: "垂直行业微调模型", type: "模型文件", icon: <Code2 className="h-4 w-4" /> },
              { name: "企业 Agent 权限模块", type: "组件", icon: <Users className="h-4 w-4" /> },
              { name: "ComfyUI 海报工作流", type: "工作流", icon: <GitFork className="h-4 w-4" /> },
            ].map((asset, i) => (
              <Link
                key={i}
                href="/listings"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-4 hover:border-brand-action/50 transition-all hover:-translate-y-1"
              >
                <div className="mb-3 p-2 rounded-xl bg-white/5 w-fit text-slate-400 group-hover:text-brand-action transition-all">
                  {asset.icon}
                </div>
                <h4 className="font-black text-slate-100 text-sm mb-1 truncate">
                  {asset.name}
                </h4>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {asset.type}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- 推荐创作者 --- */}
      <section className="py-12 border-b border-white/10 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                推荐创作者
              </h3>
              <p className="text-slate-500 mt-2 text-xs md:text-sm font-medium">
                口碑与交付证明，降低选择成本。
              </p>
            </div>
            <Link
              href="/dashboard"
              className="text-slate-400 hover:text-white font-black text-xs"
            >
              进入控制台 →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredCreators.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 p-4 hover:bg-slate-950 transition-colors"
              >
                <div className="h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/10 bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatar}
                    alt={c.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="font-black text-white truncate text-sm">
                    {c.name}
                  </div>
                  <div className="mt-1 inline-flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-2 py-0.5 text-[10px] font-black"
                    >
                      {c.badge}
                    </Badge>
                    <span className="text-[10px] font-black text-slate-500">
                      成交 {c.sales}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 第 3 层: 核心机制教学 --- */}
      <section className="py-16 bg-slate-900/30 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-black tracking-tight text-white mb-3">
              为什么选择 AI-Hub？
            </h3>
            <p className="text-slate-500 text-base font-medium max-w-2xl mx-auto">
              不仅仅是交易，更是重新定义了代码资产的商业价值。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-2xl border border-white/10 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit ring-1 ring-emerald-500/20">
                <GitFork className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-black mb-3">族谱</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                通过族谱追踪每一次引用，当有人基于您的成果赚钱时，系统会自动为您分配版税。
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/10 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-blue-500/10 text-blue-400 w-fit ring-1 ring-blue-500/20">
                <PieChart className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-black mb-3">自动分账</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                每一笔交易完成后系统瞬间完成资金清算，钱直接进您的个人钱包。
              </p>
            </div>

            <div className="p-8 rounded-2xl border border-white/10 bg-slate-950/40 text-center hover:bg-slate-950 transition-colors">
              <div className="mx-auto mb-6 p-4 rounded-2xl bg-amber-500/10 text-amber-400 w-fit ring-1 ring-amber-500/20">
                <Unlock className="h-8 w-8" />
              </div>
              <h4 className="text-xl font-black mb-3">半开源模式</h4>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                甲方低价租用方案解决痛点，乙方保留核心版权通过规模化授权获利。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- 第 4 层: 实时动态 --- */}
      <div className="py-6 bg-slate-950 border-b border-white/10">
        <LiveActivityTicker />
      </div>

      {/* --- 页脚 --- */}
      <footer className="border-t border-white/10 bg-slate-950 pt-16 pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="text-xl font-black tracking-tighter text-white uppercase mb-5 flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Zap className="h-5 w-5 fill-white" />
                </div>
                AI-Hub
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm font-medium">
                让代码资产化，让创造可持续。基于“半开源”协议的 AI 资产演化网络。
              </p>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                我的中心
              </h5>
              <ul className="space-y-4 text-xs font-bold text-slate-500">
                <li>
                  <Link
                    href="/dashboard/wallet"
                    className="hover:text-white flex items-center gap-3 transition-all group"
                  >
                    <Wallet className="h-4 w-4 group-hover:text-brand-action" />
                    我的钱包
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/orders"
                    className="hover:text-white flex items-center gap-3 transition-all group"
                  >
                    <ShoppingBag className="h-4 w-4 group-hover:text-brand-action" />
                    我的订单
                  </Link>
                </li>
                <li>
                  <Link
                    href="/help"
                    className="hover:text-white flex items-center gap-3 transition-all group"
                  >
                    <MessageSquare className="h-4 w-4 group-hover:text-brand-action" />
                    帮助中心
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                协议规则
              </h5>
              <ul className="space-y-4 text-xs font-bold text-slate-500">
                <li>
                  <Link href="/manifesto" className="hover:text-white transition-colors">
                    共生宣言
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    服务协议
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    隐私条款
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              © {new Date().getFullYear()} AI-Hub. 沪ICP备 XXXXXXXX号
            </div>
            <div className="text-slate-500">
              让每一行代码都在资产网络中持续进化
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
