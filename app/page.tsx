import Link from "next/link";
import Image from "next/image";

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
      <section className="relative overflow-hidden bg-black">
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

        <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_0_40px_rgba(255,255,255,0.06)] backdrop-blur">
              <span className="text-white">✨</span>
              <span>New Feature: AI Models Available</span>
            </div>

            {/* Title */}
            <div className="relative mt-10">
              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[80px] rounded-full -z-10" />
              <Image
                src="/hero-title.png"
                alt="智汇 AI-Hub - 专业 AI 服务交易平台"
                width={800}
                height={200}
                priority
                className="w-full max-w-[600px] h-auto object-contain mx-auto"
              />
            </div>

            <p className="mt-12 text-base leading-7 text-white/60 md:text-lg">
              Build, buy, and ship AI services with a marketplace designed for speed and trust.
            </p>

            {/* CTA */}
            <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/listings"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Explore Marketplace
              </Link>
              <Link
                href="/dashboard/listings/new"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 bg-transparent px-6 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10 hover:text-white"
              >
                Become a Creator
              </Link>
            </div>

            {/* Visual anchor */}
            <div className="mt-14 w-full">
              <div className="relative mx-auto max-w-4xl">
                <div className="pointer-events-none absolute -inset-10 rounded-[32px] shadow-[0_0_100px_rgba(255,255,255,0.10)]" />

                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-2">
                  <div className="rounded-[22px] bg-black/40 p-6 backdrop-blur">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-white/20" />
                      <div className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <div className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      <div className="ml-3 h-2.5 w-32 rounded-full bg-white/10" />
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/50">Latency</div>
                        <div className="mt-2 text-2xl font-semibold text-white">128ms</div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                          <div className="h-1.5 w-2/3 rounded-full bg-white/40" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/50">Runs</div>
                        <div className="mt-2 text-2xl font-semibold text-white">24,302</div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                          <div className="h-1.5 w-1/2 rounded-full bg-white/40" />
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                        <div className="text-xs text-white/50">Uptime</div>
                        <div className="mt-2 text-2xl font-semibold text-white">99.98%</div>
                        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                          <div className="h-1.5 w-4/5 rounded-full bg-white/40" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs text-white/50">Prompt</div>
                      <div className="mt-3 space-y-2 font-mono text-sm text-white/70">
                        <div className="h-3 w-11/12 rounded bg-white/10" />
                        <div className="h-3 w-10/12 rounded bg-white/10" />
                        <div className="h-3 w-7/12 rounded bg-white/10" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 h-[320px] w-[640px] rounded-full bg-white/10 blur-[140px]" />

                <div className="pointer-events-none absolute -bottom-12 left-1/2 -translate-x-1/2 h-24 w-[80%] bg-black blur-2xl" />
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
