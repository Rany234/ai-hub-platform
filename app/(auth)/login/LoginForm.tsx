"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/features/auth/actions";
import { toastError } from "@/lib/toast";

function toastSuccess(message: string) {
  if (typeof window !== "undefined") {
    window.alert(message);
  }
}

type State =
  | { success?: undefined; error?: undefined }
  | { success: true; data: null; redirectTo?: string }
  | { success: false; error: string };

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const [state, formAction] = useActionState<State, FormData>(loginAction, {});

  useEffect(() => {
    if (!state || state.success === undefined) return;

    if (state.success) {
      toastSuccess("登录成功，正在跳转...");
      router.refresh();
      router.push(state.redirectTo ?? "/");
      return;
    }

    toastError(state.error);
    setIsLoading(false);
  }, [state, router]);

  return (
    <div>
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
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-black text-white py-2 disabled:opacity-60"
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
