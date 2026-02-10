"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loginAction, resendVerificationAction } from "@/features/auth/actions";
import { toastError } from "@/lib/toast";
import { toast } from "sonner";

type State =
  | { success?: undefined; error?: undefined }
  | { success: true; data: null; redirectTo?: string }
  | { success: false; error: string };

export default function LoginForm() {
  return (
    <div className="min-h-[calc(100svh-4rem)] flex items-center justify-center px-6 py-16 bg-[#0B1121]">
      <div className="relative w-full max-w-md">
        <div className="pointer-events-none absolute -inset-12 rounded-[32px] bg-[radial-gradient(600px_circle_at_30%_20%,rgba(245,158,11,0.22),transparent_55%),radial-gradient(520px_circle_at_70%_80%,rgba(59,130,246,0.16),transparent_60%)] blur-2xl" />

        <div className="relative rounded-2xl border border-[#334155] bg-[#151F32] p-6 shadow-2xl">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              <span className="h-2 w-2 rounded-full bg-brand-action shadow-[0_0_18px_rgba(245,158,11,0.55)]" />
              通往黑客帝国的入口
            </div>
            <h1 className="mt-4 text-2xl font-extrabold text-white tracking-tight">登录 AI-Hub</h1>
            <p className="mt-2 text-sm text-slate-400">使用你的账号进入控制台，开始交易与交付。</p>
          </div>

          <InnerLoginForm />

          <div className="mt-6 text-sm text-slate-400">
            <a className="underline hover:text-white transition-colors" href="/signup">
              去注册
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const authErrorDescription = searchParams.get("error_description");
  const authError = searchParams.get("error");

  const [isLoading, setIsLoading] = useState(false);
  
  const [isResending, setIsResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction] = useActionState<State, FormData>(loginAction, {});

  useEffect(() => {
    if (!state || state.success === undefined) return;

    if (state.success) {
      toast.success("欢迎回来！");
      router.push(state.redirectTo ?? "/dashboard");
      router.refresh();
      return;
    }

    toastError(state.error);
  }, [state, router]);

  useEffect(() => {
    if (authError === "not_found") {
      toastError("重定向路径配置中，请尝试重新刷新页面或联系管理员");
    }
  }, [authError]);

  const showExpired = !!authErrorDescription;

  return (
    <div className="space-y-6">
      {showExpired ? (
        <div className="mb-4 rounded-xl border border-amber-900/50 bg-amber-900/20 p-4 text-amber-400">
          <div className="text-sm font-semibold">验证链接已过期或失效？</div>
          <div className="mt-1 text-sm opacity-90">{authErrorDescription}</div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={!email || isResending || resendDone}
              className="rounded-md bg-amber-600 text-white px-4 py-2 text-sm font-medium disabled:opacity-60 hover:bg-amber-500 transition-colors"
              onClick={async () => {
                if (!email) return;
                setIsResending(true);
                const res = await resendVerificationAction(email);
                setIsResending(false);
                if (!res.success) {
                  toastError(res.error);
                  return;
                }
                setResendDone(true);
              }}
            >
              {resendDone ? "已发送，请查收" : isResending ? "发送中..." : "重新发送验证邮件"}
            </button>
            <a className="rounded-md border border-[#334155] bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 transition-colors" href="/signup">
              重新注册
            </a>
          </div>
          <div className="mt-2 text-xs opacity-80">提示：请先在下方填写邮箱，再点击重发。</div>
        </div>
      ) : null}

      <form
        action={async (formData) => {
          setIsLoading(true);
          try {
            await formAction(formData);
          } catch (error) {
            // 放行 NEXT_REDIRECT，避免跳转被当成错误
            if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
              throw error;
            }
            // 其他错误交给 useActionState 的 state.error 处理
            console.error('Login form error:', error);
          } finally {
            // 强制清理 loading 状态，防止卡死
            setIsLoading(false);
          }
        }}
        className="mt-6 space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full bg-[#0B1121] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
            placeholder="name@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300" htmlFor="password">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full bg-[#0B1121] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
            placeholder="••••••••"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-xl py-3 text-white font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100 ${
            state && state.success 
              ? "bg-emerald-600 shadow-emerald-900/20" 
              : "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-900/20"
          }`}
        >
          {isLoading ? "验证身份中..." : "进入控制台"}
        </button>

        {state && state.success === false ? (
          <p className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded-lg text-center">{state.error}</p>
        ) : null}
      </form>

    </div>
  );
}
