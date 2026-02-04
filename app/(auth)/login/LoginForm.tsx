"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";

type State =
  | { success?: undefined; error?: undefined }
  | { success: true; data: null; redirectTo?: string }
  | { success: false; error: string };

export default function LoginForm() {
  const router = useRouter();

  const [state, formAction] = useActionState<State, FormData>(
    // @ts-expect-error - Next will provide the correct types at runtime
    loginAction,
    {}
  );

  useEffect(() => {
    if (state && state.success) {
      router.push(state.redirectTo ?? "/dashboard");
      router.refresh();
    }
  }, [state, router]);

  return (
    <div>
      <form action={formAction} className="mt-6 space-y-4">
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
          />
        </div>

        <AuthSubmitButton pendingText="登录中..." idleText="登录" />

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
