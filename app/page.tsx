import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Section 1: Hero (The Vision) */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_20%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_35%,rgba(168,85,247,0.35),transparent_55%),radial-gradient(900px_circle_at_55%_85%,rgba(34,211,238,0.18),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.35),rgba(2,6,23,0.92))]" />
          <div className="absolute inset-0 bg-grid-white/[0.03]" />
          <div className="absolute inset-0 bg-[url(https://grainy-gradients.vercel.app/noise.svg)] opacity-[0.04]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 lg:pt-28 lg:pb-20">
          <div className="flex flex-col items-start gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
                进化资产网络 · 代码可复用 · 引用可分润
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-400">
                  代码即资产，引用即挖矿
                </span>
              </h1>

              <p className="mt-5 text-base leading-relaxed text-slate-300 sm:text-lg">
                世界首个 AI-Hub：让每一行代码持续进化。你可以发布悬赏来拥有可复用资产，也可以 Remix 他人的资产，自动获得 10% 协议分润。
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-7 py-3 text-sm font-extrabold text-white shadow-[0_18px_60px_rgba(37,99,235,0.25)] transition hover:from-blue-400 hover:to-purple-500 active:scale-95"
                >
                  探索资产
                </Link>
                <Link
                  href="/dashboard/jobs/new"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-7 py-3 text-sm font-semibold text-slate-100 backdrop-blur transition hover:bg-white/10 active:scale-95"
                >
                  发布悬赏
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">可复用组件</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">资产谱系</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">自动分润</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">协议激励</span>
              </div>
            </div>

            <div className="w-full max-w-xl">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur">
                <div className="absolute -left-28 -top-28 h-72 w-72 rounded-full bg-purple-700/20 blur-[90px]" />
                <div className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full bg-blue-600/20 blur-[90px]" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-200">资产进化预览</div>
                    <div className="rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-xs text-slate-300">
                      Remix Tree Demo
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-extrabold text-white">BaseAsset: Auth Kit</div>
                        <div className="text-xs text-slate-400">拥有权</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">登录 / 权限 / Token 刷新 · 可复用</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <div className="text-sm font-bold text-slate-100">Remix A</div>
                        <div className="mt-2 text-xs text-slate-400">适配 NextAuth</div>
                        <div className="mt-3 text-xs font-semibold text-emerald-300">+10% 分润</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                        <div className="text-sm font-bold text-slate-100">Remix B</div>
                        <div className="mt-2 text-xs text-slate-400">增加 RBAC</div>
                        <div className="mt-3 text-xs font-semibold text-emerald-300">+10% 分润</div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-bold text-slate-100">Remix C</div>
                        <div className="text-xs text-slate-400">自动结算</div>
                      </div>
                      <div className="mt-2 text-xs text-slate-400">每次被引用都会触发协议分润</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-4">
                    <div className="text-xs text-slate-300">
                      这是静态演示：后续可替换为真实的 RemixTree 组件。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: The Double Engine (How it Works) */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">双引擎：让价值从一次交易变为长期收益</h2>
          <p className="text-sm text-slate-400 sm:text-base">
            需求侧用悬赏生产可复用资产，供给侧用 Remix 让资产产生谱系与分润。
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:bg-white/7">
            <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-600/15 blur-[80px]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-xl">
                  🎯
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">需求侧 · 悬赏大厅</div>
                  <div className="text-lg font-extrabold text-white">反向市场（Reverse Market）</div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                不再为一次性需求支付全额。发布悬赏来获取“可复用组件资产”，让同一份投入被重复使用，整体成本可降低 50%。
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard/jobs/new"
                  className="inline-flex items-center justify-center rounded-full bg-slate-950/50 px-5 py-2 text-sm font-bold text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-950/70"
                >
                  去发布悬赏
                </Link>
                <Link
                  href="/dashboard/jobs"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white"
                >
                  查看悬赏大厅 →
                </Link>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur transition hover:bg-white/7">
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-56 w-56 rounded-full bg-purple-700/15 blur-[80px]" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40 text-xl">
                  🧬
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">供给侧 · 资产谱系</div>
                  <div className="text-lg font-extrabold text-white">可视化价值链（Visualized Value Chain）</div>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-slate-300">
                追踪资产如何进化：每一次 Remix 都会记录在谱系中。你的作品被引用时，协议将自动结算分润，持续获得收益。
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                <div className="text-xs font-semibold text-slate-300">迷你谱系示意</div>
                <div className="mt-3 grid gap-2 text-xs text-slate-400">
                  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                    <span>BaseAsset</span>
                    <span className="text-slate-300">100%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-slate-200">Remix</div>
                      <div className="mt-1 text-emerald-300">自动分润</div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                      <div className="text-slate-200">Remix</div>
                      <div className="mt-1 text-emerald-300">自动分润</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/listings"
                  className="inline-flex items-center justify-center rounded-full bg-slate-950/50 px-5 py-2 text-sm font-bold text-slate-100 ring-1 ring-white/10 transition hover:bg-slate-950/70"
                >
                  去探索资产
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-semibold text-slate-300 hover:text-white"
                >
                  查看我的工作台 →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Live Ecosystem Stats (Social Proof) */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_20%,rgba(59,130,246,0.18),transparent_60%),radial-gradient(900px_circle_at_80%_80%,rgba(168,85,247,0.18),transparent_60%)]" />
          <div className="relative">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-extrabold text-white">生态实时数据</h3>
              <p className="text-sm text-slate-400">用数据证明：资产正在持续进化。</p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-6">
                <div className="text-sm font-semibold text-slate-400">资产进化中</div>
                <div className="mt-3 text-3xl font-extrabold text-white">120+</div>
                <div className="mt-2 text-xs text-slate-500">持续增长</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-6">
                <div className="text-sm font-semibold text-slate-400">活跃悬赏金额</div>
                <div className="mt-3 text-3xl font-extrabold text-white">¥50,000+</div>
                <div className="mt-2 text-xs text-slate-500">真实需求驱动</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-6">
                <div className="text-sm font-semibold text-slate-400">已支付 Remix 分润</div>
                <div className="mt-3 text-3xl font-extrabold text-white">¥8,000+</div>
                <div className="mt-2 text-xs text-slate-500">自动结算</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: CTA Footer */}
      <footer className="mx-auto max-w-6xl px-6 pb-16">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-blue-500/15 via-purple-600/15 to-cyan-400/10 p-10 shadow-[0_18px_60px_rgba(0,0,0,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(2,6,23,0.15),rgba(2,6,23,0.85))]" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="text-2xl font-extrabold text-white">停止为一次性报酬写代码，开始构建你的长期遗产。</div>
              <div className="mt-2 text-sm text-slate-300">
                把你的创作变成资产，让每一次被引用都为你持续产出价值。
              </div>
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-extrabold text-slate-950 shadow-[0_18px_60px_rgba(0,0,0,0.35)] transition hover:bg-slate-100 active:scale-95"
            >
              加入革命
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 md:flex-row">
          <div>© {new Date().getFullYear()} AI-Hub · 进化资产网络</div>
          <div className="flex gap-4">
            <Link className="hover:text-slate-300" href="/listings">
              资产市场
            </Link>
            <Link className="hover:text-slate-300" href="/dashboard">
              控制台
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
