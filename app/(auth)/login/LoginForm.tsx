"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { loginAction, resendVerificationAction } from "@/features/auth/actions";
import { toastError } from "@/lib/toast";

type State =
  | { success?: undefined; error?: undefined }
  | { success: true; data: null; redirectTo?: string }
  | { success: false; error: string };

export default function LoginForm() {
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
    <div>
      {showExpired ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="text-sm font-semibold">验证链接已过期或失效？</div>
          <div className="mt-1 text-sm opacity-90">{authErrorDescription}</div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              disabled={!email || isResending || resendDone}
              className="rounded-md bg-amber-900 text-amber-50 px-4 py-2 text-sm font-medium disabled:opacity-60"
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
            <a className="rounded-md border border-amber-300 bg-white px-4 py-2 text-sm font-medium" href="/signup">
              重新注册
            </a>
          </div>
          <div className="mt-2 text-xs opacity-80">提示：请先在下方填写邮箱，再点击重发。</div>
        </div>
      ) : null}

      <form
        action={async (formData) => {
          setIsLoading(true);
          await formAction(formData);
        }}
        className="mt-6 space-y-4"
      >
        <div className="space-y-1">
          <label className="text-sm" htmlFor="email">
            邮箱
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full border rounded-md px-3 py-2"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm" htmlFor="password">
            密码
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full border rounded-md px-3 py-2"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full rounded-md py-2 text-white disabled:opacity-60 ${
            isSuccess ? "bg-green-600" : "bg-black"
          }`}
        >
          {isLoading ? "登录中..." : "登录"}
        </button>

        {state && state.success === false ? (
          <p className="text-sm text-red-600">{state.error}</p>
        ) : null}
      </form>

      <div className="mt-4 text-sm">
        <a className="underline" href="/signup">
          去注册
        </a>
      </div>
    </div>
  );
}
