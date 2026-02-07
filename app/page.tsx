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
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold">市场</h1>
        <p className="mt-4 text-sm text-red-600">{error.message}</p>
      </div>
    );
  }

  const hasListings = (listings ?? []).length > 0;

  return (
    <div>
      {/* Hero + Search */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-90 [background:radial-gradient(1200px_circle_at_20%_20%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_30%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(900px_circle_at_50%_80%,rgba(59,130,246,0.22),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.55),rgba(2,6,23,0.85))]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 gap-12 items-center lg:grid-cols-2">
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_18px_rgba(99,102,241,0.65)]" />
                专业的 AI 服务与技能交易平台
              </div>

              <h1 className="mt-6 text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl bg-clip-text bg-gradient-to-r from-indigo-200 via-sky-200 to-fuchsia-200">
                智汇 AI-Hub
              </h1>

              <p className="mt-5 text-lg text-slate-300">
                汇聚全球智慧，<span className="font-semibold text-slate-100">连接 AI 价值</span>
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                一站式 AI 技能交易市场。无论是寻找 Prompt 工程师，还是出售你的微调模型，这里都是你的最佳起点。
              </p>

              <form className="mt-8" action="/listings">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <input
                      type="search"
                      name="q"
                      placeholder="搜索 AI 服务、提示词、模型..."
                      className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-base text-slate-100 placeholder:text-slate-400 shadow-[0_18px_60px_rgba(0,0,0,0.55)] outline-none ring-1 ring-white/5 backdrop-blur transition focus:border-white/20 focus:ring-2 focus:ring-indigo-500/40"
                      aria-label="搜索"
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-4 hidden items-center text-slate-400 sm:flex">
                      ⌘K
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="rounded-full bg-white text-slate-950 px-7 py-3 font-semibold shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition hover:bg-white/90"
                  >
                    搜索
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span className="text-slate-500">热门：</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">Midjourney 调试</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">智能体开发</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur">数据分析</span>
                </div>
              </form>

              <div className="mt-10 flex items-center gap-3">
                <HeroExploreButton />

                <a
                  href="/dashboard/listings/new"
                  className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition hover:bg-white/90"
                >
                  成为创作者
                </a>
              </div>
            </div>

            <div className="relative">
              <AIDemoComponent />
            </div>
          </div>
        </div>
      </section>

      <LiveActivityTicker />

      {/* Featured Works */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-14">
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
                className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-sm font-bold text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.55)] transition hover:bg-white/90"
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
            <div className="mt-10 columns-1 gap-6 space-y-6 sm:columns-2 lg:columns-3">
              {Array.from({ length: 6 }).map((_, idx) => {
                const listing = (listings ?? [])[idx];
                const hasPreview = Boolean(listing?.preview_url);
                const injectedPreviewUrl = `https://picsum.photos/seed/${Math.floor(Math.random() * 100000)}/800/600`;

                const injected = listing
                  ? ({
                      ...listing,
                      preview_url: hasPreview ? listing.preview_url : injectedPreviewUrl,
                    } as any)
                  : ({
                      id: `injected-${idx}`,
                      title: `AI 艺术作品 ${idx + 1}`,
                      description: "AI 生成演示",
                      preview_url: injectedPreviewUrl,
                      metadata: {
                        seller_name: "AI 艺术家",
                        seller_avatar_url: null,
                      },
                    } as any);

                return (
                  <div key={injected.id} className="break-inside-avoid">
                    <FeaturedWorkCard listing={injected} index={idx} />
                  </div>
                );
              })}
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
  );
}