"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message = error?.message ? error.message : "系统遇到了一点问题";

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-lg p-6 text-center">
        <h1 className="text-2xl font-semibold">出错了</h1>
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
        <button
          type="button"
          className="inline-block mt-6 rounded-md bg-black text-white px-4 py-2"
          onClick={() => reset()}
        >
          重试
        </button>
      </div>
    </div>
  );
}
