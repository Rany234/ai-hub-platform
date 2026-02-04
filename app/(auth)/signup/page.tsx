import { getFriendlyAuthErrorMessage } from "@/features/auth/error";

import { SignupForm } from "./SignupForm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawError = typeof sp.error === "string" ? sp.error : undefined;
  const error = getFriendlyAuthErrorMessage(rawError);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6">
        <h1 className="text-2xl font-semibold">注册</h1>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

        <SignupForm />
      </div>
    </div>
  );
}
