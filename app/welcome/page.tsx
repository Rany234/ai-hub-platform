import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export default async function WelcomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1121]">
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-12 rounded-[32px] bg-[radial-gradient(600px_circle_at_50%_50%,rgba(16,185,129,0.12),transparent_60%)] blur-3xl" />
        
        <div className="relative text-center space-y-6 px-8 py-12 rounded-3xl border border-[#334155] bg-[#151F32] shadow-2xl">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.1)]">
              <svg
                className="w-10 h-10 text-emerald-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight">账号激活成功！</h1>

          <p className="text-slate-400 leading-relaxed">
            欢迎加入 <span className="text-slate-200 font-bold">智汇 AI-Hub</span><br/>
            您的账户已准备就绪，可以开始探索 AI 的无限可能。
          </p>

          <a
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl bg-brand-action px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-amber-900/20 hover:bg-amber-600 transition-all active:scale-[0.98]"
          >
            进入控制台
          </a>
        </div>
      </div>
    </div>
  );
}
