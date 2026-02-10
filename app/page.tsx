import Link from "next/link";
import { Search } from "lucide-react";

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
      {/* Hero */}
      <section className="relative overflow-hidden min-h-[60vh] bg-[#0B1120]">
        {/* Noise overlay (static) */}
        <div
          className="pointer-events-none fixed inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E)",
          }}
        />

        {/* Grid + vignette */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-60 [background:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_20%,rgba(255,255,255,0.10),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_50%_90%,rgba(255,255,255,0.06),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.25),rgba(0,0,0,0.85))]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 shadow-[0_0_40px_rgba(255,255,255,0.06)] backdrop-blur">
            <span className="text-white text-sm">🚀</span>
            <span>Trusted by 500+ Enterprises</span>
          </div>

          {/* Title */}
          <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Find the perfect AI Expert <br className="hidden md:block" /> for your business
          </h1>

          <p className="mt-4 text-lg md:text-xl text-slate-400 max-w-2xl">
            Marketplace for Prompts, Models, and AI Workflow.
          </p>

          {/* Super Search Bar */}
          <form className="mt-12 w-full max-w-3xl" action="/listings">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-full bg-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
              <div className="relative flex items-center h-16 bg-[#151F32]/80 border border-[#334155] backdrop-blur-md rounded-full px-2 overflow-hidden focus-within:border-indigo-500/50 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                <Search className="ml-4 h-6 w-6 text-slate-400" />
                <input
                  type="search"
                  name="q"
                  placeholder="Search for AI experts, prompts, or agents..."
                  className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder:text-slate-500 text-lg"
                  aria-label="Search"
                />
                <button
                  type="submit"
                  className="h-12 px-8 rounded-full bg-brand-primary text-white font-bold hover:brightness-110 transition-all active:scale-95 shadow-lg"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Trust Bar */}
          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
              Trusted by industry leaders
            </p>
            <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-40 grayscale contrast-125">
              <span className="text-xl font-bold text-white tracking-tighter">Microsoft</span>
              <span className="text-xl font-bold text-white tracking-tighter italic">OpenAI</span>
              <span className="text-xl font-bold text-white tracking-tighter">Google</span>
              <span className="text-xl font-bold text-white tracking-tighter font-serif">Meta</span>
              <span className="text-xl font-bold text-white tracking-tighter">ANTHROPIC</span>
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
