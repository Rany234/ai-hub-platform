import Link from "next/link";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { BentoCard } from "@/components/BentoCard";
import { HeroExploreButton } from "@/components/HeroExploreButton";
import { AIDemoComponent } from "@/components/AIDemoComponent";
import { FeaturedWorkCard } from "@/components/FeaturedWorkCard";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">市场</h1>
        <p className="mt-4 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const featuredListings = (listings ?? []).filter((l) => typeof l.id === "string" && l.id.length > 0);
  const hasListings = featuredListings.length > 0;

  return (
    <div>
      {/* Hero + Search */}
      <section className="relative overflow-hidden bg-brand-dark">
        {/* Atmosphere Background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(1200px_circle_at_20%_20%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(900px_circle_at_50%_80%,rgba(59,130,246,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0.1),rgba(15,23,42,0.9))]" />
        </div>

        {/* Top-center large fuzzy glow */}
        <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-brand-primary/20 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-32">
          <div className="grid grid-cols-1 gap-16 items-center lg:grid-cols-2">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-brand-glow shadow-[0_0_12px_rgba(56,189,248,0.8)]" />
                专业的 AI 服务与技能交易平台
              </div>

              <h1 className="mt-8 text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl lg:text-8xl bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                智汇 AI-Hub
              </h1>

              <p className="mt-6 text-xl text-slate-300 max-w-lg leading-relaxed">
                汇聚全球智慧，<span className="font-semibold text-white">连接 AI 价值</span>
              </p>
              <p className="mt-4 text-base leading-7 text-slate-400 max-w-md">
                一站式 AI 技能交易市场。无论是寻找 Prompt 工程师，还是出售你的微调模型，这里都是你的最佳起点。
              </p>

              {/* Glassmorphism Search Bar */}
              <form className="mt-10 max-w-xl" action="/listings">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="search"
                      name="q"
                      placeholder="搜索 AI 服务、提示词、模型..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-base text-white placeholder:text-slate-500 shadow-2xl outline-none backdrop-blur-md transition-all focus:border-brand-primary/50 focus:ring-4 focus:ring-brand-primary/10"
                      aria-label="搜索"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-5 hidden items-center text-slate-500 sm:flex">
                      <kbd className="font-sans text-xs opacity-50">⌘K</kbd>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-2xl bg-white text-brand-dark px-8 py-4 font-bold shadow-glow transition-all hover:scale-105 active:scale-95"
                  >
                    搜索
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-medium">热门：</span>
                  {["Midjourney 调试", "智能体开发", "数据分析"].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/5 bg-white/5 px-3 py-1 hover:text-brand-glow transition-colors cursor-pointer">
                      {tag}
                    </span>
                  ))}
                </div>
              </form>

              <div className="mt-12 flex items-center gap-4">
                <HeroExploreButton />
                <a
                  href="/dashboard/listings/new"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                >
                  成为创作者
                </a>
              </div>
            </div>

            <div className="relative group">
              {/* Decorative Glow behind Demo Card */}
              <div className="absolute -inset-4 bg-brand-primary/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative rounded-3xl border border-white/10 bg-brand-dark/40 backdrop-blur-sm p-2 shadow-glow">
                <AIDemoComponent />
              </div>
            </div>
          </div>
        </div>
      </section>

      <LiveActivityTicker />

      {/* Featured Works */}
      <section className="bg-brand-dark">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between mb-12">
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                智汇精选：激发你的 AI 灵感
              </h2>
              <p className="max-w-2xl text-base text-slate-400">
                像艺术画廊一样浏览高质量 AI 作品与 Agent 方案，点击即可直达该服务的 AI 套餐。
              </p>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                  href="/dashboard"
                >
                  进入控制台
                </Link>
              ) : (
                <Link
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/10"
                  href="/login"
                >
                  登录 / 注册
                </Link>
              )}

              <Link
                className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-6 py-2.5 text-sm font-bold text-white shadow-glow transition hover:brightness-110"
                href="/dashboard/listings/new"
              >
                立即发布服务
              </Link>
            </div>
          </div>

          {!hasListings ? (
            <div className="rounded-3xl border border-white/5 bg-white/5 p-16 text-center text-white backdrop-blur-sm">
              <h3 className="text-xl font-bold">市场刚刚开张，还没有作品。</h3>
              <p className="mt-2 text-sm text-slate-400">
                发布你的第一个作品，让更多人看到你的创作。
              </p>
            </div>
          ) : (
            <div className="columns-1 gap-8 space-y-8 sm:columns-2 lg:columns-3">
              {featuredListings.map((listing, idx) => (
                <div key={listing.id} className="break-inside-avoid">
                  <FeaturedWorkCard listing={listing} index={idx} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
