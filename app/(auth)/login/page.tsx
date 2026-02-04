import { getFriendlyAuthErrorMessage } from "@/features/auth/error";

import LoginForm from "./LoginForm";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawError = typeof sp.error === "string" ? sp.error : undefined;
  const verified = sp.verified === "true";
  const error = verified ? undefined : getFriendlyAuthErrorMessage(rawError);
  const redirectedFrom = typeof sp.redirectedFrom === "string" ? sp.redirectedFrom : undefined;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6">
        <h1 className="text-2xl font-semibold">登录</h1>
        {verified ? (
          <p className="mt-2 text-sm text-green-600">邮箱验证成功！为了您的安全，请重新登录。</p>
        ) : null}
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        {redirectedFrom ? (
          <p className="mt-2 text-sm text-muted-foreground">
            你需要登录后才能访问：<span className="font-mono">{redirectedFrom}</span>
          </p>
        ) : null}

        <LoginForm />
      </div>
    </div>
  );
}
