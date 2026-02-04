"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { loginAction } from "@/features/auth/actions";
import { toastError } from "@/lib/toast";

type State =
  | { success?: undefined; error?: undefined }
  | { success: true; data: null; redirectTo?: string }
  | { success: false; error: string };

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [state, formAction] = useActionState<State, FormData>(loginAction, {});

  useEffect(() => {
    if (!state || state.success === undefined) return;

    if (state.success) {
      setIsSuccess(true);
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isSuccess}
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
            disabled={isLoading || isSuccess}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || isSuccess}
          className={`w-full rounded-md py-2 text-white disabled:opacity-60 ${
            isSuccess ? "bg-green-600" : "bg-black"
          }`}
        >
          {isSuccess ? "登录成功，正在跳转..." : isLoading ? "登录中..." : "登录"}
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
