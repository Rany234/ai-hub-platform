import Link from "next/link";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { BentoCard } from "@/components/BentoCard";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

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
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight">
                智汇 AI-Hub
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                汇聚全球智慧，连接 AI 价值
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                一站式 AI 技能交易市场。无论是寻找 Prompt 工程师，还是出售你的微调模型，这里都是你的最佳起点。
              </p>
              <form className="mt-8 flex flex-col sm:flex-row gap-3" action="/listings">
                <input
                  type="search"
                  name="q"
                  placeholder="搜索 AI 服务、提示词、模型..."
                  className="flex-1 rounded-lg border px-4 py-3 text-base placeholder:text-muted-foreground"
                  aria-label="搜索"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-black text-white px-6 py-3 font-medium"
                >
                  搜索
                </button>
              </form>
            </div>
            <div className="relative">
              {/* 3D/动态演示图占位 */}
              <div className="aspect-[16/9] rounded-2xl border bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-muted-foreground">
                <span className="text-lg">AI 生成演示图</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Gallery */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-baseline justify-between gap-4 mb-8">
          <h2 className="text-2xl font-semibold">精选作品</h2>
          <Link className="text-sm underline" href="/dashboard/listings/new">
            发布作品
          </Link>
        </div>

        {!hasListings ? (
          <div className="mt-10 flex items-center justify-center">
            <div className="w-full max-w-2xl border rounded-xl p-10 text-center">
              <h2 className="text-2xl font-semibold">市场刚刚开张，还没有作品。</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                发布你的第一个作品，让更多人看到你的创作。
              </p>
              <Link
                className="inline-flex mt-8 items-center justify-center rounded-md bg-black text-white px-6 py-3 text-base"
                href="/dashboard/listings/new"
              >
                成为第一个创作者
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[200px] gap-4">
            {(listings ?? []).map((listing, idx) => {
              // Feature Card: first 2 items take 2x2 grid
              const isFeature = idx < 2;
              return (
                <BentoCard
                  key={listing.id}
                  listing={listing}
                  featured={isFeature}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}