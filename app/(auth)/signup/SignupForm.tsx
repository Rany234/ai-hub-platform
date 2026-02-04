"use client";

import { useActionState } from "react";

import { signUpAction } from "@/features/auth/actions";
import { AuthSubmitButton } from "@/features/auth/components/AuthSubmitButton";

type SignUpInputs = {
  email?: string;
  username?: string;
  fullName?: string;
};

type State =
  | { success?: undefined; error?: undefined; inputs?: SignUpInputs }
  | {
      success: true;
      data: null;
      redirectTo?: string;
      requireVerification?: boolean;
      inputs?: SignUpInputs;
    }
  | { success: false; error: string; inputs?: SignUpInputs };

function normalizeError(raw: string): string {
  const trimmed = raw.trim();

  try {
    const parsed: unknown = JSON.parse(trimmed);

    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0] as unknown;
      if (first && typeof first === "object" && "message" in first) {
        const msg = (first as { message?: unknown }).message;
        if (typeof msg === "string" && msg.trim().length > 0) return msg;
      }
    }
  } catch {
    // ignore JSON parse errors
  }

  return raw;
}

export function SignupForm() {
  const [state, formAction] = useActionState<State, FormData>(
    // @ts-expect-error - Next will provide the correct types at runtime
    signUpAction,
    {}
  );

  const isCheckEmailVisible = state?.success === true && state.requireVerification === true;

  if (isCheckEmailVisible) {
    return (
      <div className="mt-6 border rounded-lg p-8">
        <div className="text-5xl">📧</div>
        <h2 className="mt-4 text-xl font-semibold">验证邮件已发送</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          我们已向您的邮箱发送了一封确认邮件，请点击邮件中的链接激活账号。
        </p>
        <a
          className="inline-flex mt-6 items-center justify-center rounded-md bg-black text-white px-4 py-2 text-sm"
          href="/login"
        >
          返回登录页
        </a>
      </div>
    );
  }

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
            defaultValue={state.inputs?.email ?? ""}
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
            autoComplete="new-password"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm" htmlFor="username">
            用户名（可选）
          </label>
          <input
            id="username"
            name="username"
            type="text"
            defaultValue={state.inputs?.username ?? ""}
            className="w-full border rounded-md px-3 py-2"
            autoComplete="username"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm" htmlFor="fullName">
            真实姓名（可选）
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            defaultValue={state.inputs?.fullName ?? ""}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <AuthSubmitButton pendingText="注册中..." idleText="注册" />

        {state && state.success === false ? (
          <p className="text-sm text-red-600">{normalizeError(state.error)}</p>
        ) : null}
      </form>

      <div className="mt-4 text-sm">
        <a className="underline" href="/login">
          返回登录
        </a>
      </div>
    </div>
  );
}
