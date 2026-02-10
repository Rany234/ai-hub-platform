import Link from "next/link";

import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { BentoCard } from "@/components/BentoCard";
import { HeroExploreButton } from "@/components/HeroExploreButton";
import { AIDemoComponent } from "@/components/AIDemoComponent";
import { FeaturedWorkCard } from "@/components/FeaturedWorkCard";
import { LiveActivityTicker } from "@/components/LiveActivityTicker";
import { HeroAudienceToggle } from "@/components/home/HeroAudienceToggle";
import { ServiceMatrix } from "@/components/home/ServiceMatrix";
import { TrustProcess } from "@/components/home/TrustProcess";

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
    <div className="bg-slate-950">
      {/* Hero + Search */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          {/* Noise/Grid Texture Layer */}
          <div className="absolute inset-0 bg-[url(https://grainy-gradients.vercel.app/noise.svg)] opacity-[0.03] brightness-100 contrast-150" />
          <div className="absolute inset-0 bg-grid-white/[0.02]" />
          
          <div className="absolute inset-0 opacity-90 [background:radial-gradient(1200px_circle_at_20%_20%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(900px_circle_at_50%_80%,rgba(59,130,246,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.55),rgba(2,6,23,0.85))]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-brand-action shadow-[0_0_18px_rgba(245,158,11,0.55)]" />
                AI-Hub 中国版 · 深色商业风
              </div>

              <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-400">
                一站式 AI 技能与服务交易平台
              </h1>

              <h2 className="mt-5 text-lg sm:text-xl text-slate-300">
                连接 500+ 企业需求，让你的 Prompt 与模型产生被动收入。
              </h2>

              <form
                action="/listings"
                className="mt-8 w-full max-w-2xl flex items-center bg-white/5 border border-white/10 rounded-full p-2 backdrop-blur-md shadow-lg"
              >
                <div className="flex-1 flex items-center gap-3 px-4">
                  <span className="text-slate-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                  <input
                    name="q"
                    placeholder="搜索 AI 提示词、模型、服务..."
                    className="flex-1 bg-transparent border-none text-white placeholder:text-slate-400 focus:ring-0 px-0 h-12 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-brand-action px-6 h-12 text-sm font-bold text-black shadow-[0_0_18px_rgba(245,158,11,0.25)] transition hover:bg-amber-500"
                >
                  搜索
                </button>
              </form>


              <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
                <Link
                  href="/dashboard/listings/new"
                  className="inline-flex items-center justify-center rounded-full bg-black border border-amber-500/20 px-7 py-3 text-sm font-bold text-amber-500 transition-all hover:border-amber-500/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.3)] active:scale-95"
                >
                  立即入驻赚钱
                </Link>

                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-transparent px-7 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  寻找 AI 专家
                </Link>
              </div>

              <div className="mt-10 text-sm text-slate-400">
                支持主流模型生态: <span className="text-slate-300">OpenAI</span> / <span className="text-slate-300">Midjourney</span> / <span className="text-slate-300">Claude</span>
              </div>
            </div>

            <div className="relative">
              {/* Ambient Light (behind AIDemoComponent) */}
              <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -left-28 -top-24 h-[520px] w-[520px] rounded-full bg-purple-900 opacity-20 blur-[120px] animate-[heroBlobA_14s_ease-in-out_infinite]" />
                <div className="absolute -right-28 -bottom-24 h-[560px] w-[560px] rounded-full bg-amber-600 opacity-15 blur-[120px] animate-[heroBlobB_18s_ease-in-out_infinite]" />
              </div>

              <AIDemoComponent />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 py-24 space-y-24">
        <section>
          <HeroAudienceToggle />
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            全方位 AI 服务体系
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            从轻量级资产到重量级方案，清晰理解 AI-Hub 的核心业务架构。
          </p>
          <div className="mt-10">
            <ServiceMatrix />
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            安全、透明的担保交易机制
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-400">
            资金托管、分阶段验收、自动结算，让高客单 AI 服务交易更安心。
          </p>
          <div className="mt-10">
            <TrustProcess />
          </div>
        </section>

        {/* Featured Works */}
        <section>
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  智汇精选：激发你的 AI 灵感
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-slate-400">
                  像艺术画廊一样浏览高质量 AI 作品与 Agent 方案，点击即可直达该服务的 AI 套餐。
                </p>
              </div>

              <div className="flex items-center gap-3">
                {user ? (
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur transition hover:bg-white/10"
                    href="/dashboard"
                  >
                    进入控制台
                  </Link>
                ) : (
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur transition hover:bg-white/10"
                    href="/login"
                  >
                    登录 / 注册
                  </Link>
                )}

                <Link
                  className="inline-flex items-center justify-center rounded-full bg-brand-action px-5 py-2 text-sm font-bold text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition hover:bg-amber-600"
                  href="/dashboard/listings/new"
                >
                  你也有惊艳的 AI 作品？立即发布服务
                </Link>
              </div>
            </div>

            {!hasListings ? (
              <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 text-center text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur">
                <h3 className="text-xl font-bold">市场刚刚开张，还没有作品。</h3>
                <p className="mt-2 text-sm text-slate-400">
                  发布你的第一个作品，让更多人看到你的创作。
                </p>
              </div>
            ) : (
              <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {featuredListings.map((listing, idx) => (
                  <FeaturedWorkCard key={listing.id} listing={listing} index={idx} />
                ))}
              </div>
            )}

            <div className="mt-12 flex justify-center">
              <Link
                href="/dashboard/listings/new"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur transition hover:bg-white/10"
              >
                你也有惊艳的 AI 作品？立即发布服务
              </Link>
            </div>
          </div>
        </section>
      </div>

      <section>
        <LiveActivityTicker />
      </section>
    </div>
  );
}
