"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { signUpAction } from "@/features/auth/actions";
import { toastError } from "@/lib/toast";

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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [state, formAction] = useActionState<State, FormData>(
    signUpAction,
    {}
  );

  useEffect(() => {
    if (!state || state.success === undefined) return;

    if (state.success) {
      setIsSuccess(true);

      if (state.redirectTo) {
        router.refresh();
        router.push(state.redirectTo);
      }

      return;
    }

    toastError(normalizeError(state.error));
    setIsLoading(false);
  }, [state, router]);

  const isCheckEmailVisible = state?.success === true && state.requireVerification === true;

  const emailDomain = useMemo(() => {
    if (!email) return "";
    const parts = email.toLowerCase().split("@");
    return parts.length > 1 ? parts[1] : "";
  }, [email]);

  const mailProvider = useMemo(() => {
    if (!emailDomain) return null;
    if (emailDomain.includes("gmail.com")) return { name: "Gmail", url: "https://mail.google.com" };
    if (emailDomain.includes("outlook.com") || emailDomain.includes("hotmail.com"))
      return { name: "Outlook", url: "https://outlook.live.com" };
    return null;
  }, [emailDomain]);

  if (isCheckEmailVisible) {
    return (
      <div className="mt-6 border rounded-xl p-8 text-center space-y-6">
        <div className="text-6xl">📩</div>

        <div>
          <h2 className="text-xl font-semibold">只差最后一步了！</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            请点击邮件中的链接激活账号。
          </p>
        </div>

        {mailProvider ? (
          <a
            href={mailProvider.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            打开 {mailProvider.name}
          </a>
        ) : (
          <a
            href={`https://${emailDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-6 py-3 text-base font-medium hover:bg-gray-800 transition-colors"
          >
            打开邮箱
          </a>
        )}

        <div className="text-sm text-muted-foreground">
          已在其他窗口完成验证？
          <Link href="/login" className="ml-1 underline hover:text-foreground">
            立即登录
          </Link>
        </div>
      </div>
    );
  }

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isSuccess}
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
            className="w-full border rounded-md px-3 py-2"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading || isSuccess}
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
            className="w-full border rounded-md px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
          {isSuccess
            ? "注册成功，请查收邮件验证"
            : isLoading
              ? "注册中..."
              : "注册"}
        </button>

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
