"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createOrderAction } from "@/features/orders/actions";

export function RequirementOrderClient({ listingId }: { listingId: string }) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setPending(true);
    setError(null);

    const result = await createOrderAction(listingId, requirements);

    if (!result.success) {
      if (result.code === "UNAUTHORIZED") {
        router.push(`/login?redirectedFrom=${encodeURIComponent(`/listings/${listingId}`)}`);
        router.refresh();
        return;
      }

      // Show exact backend error for debugging
      setError(result.error);
      setPending(false);
      return;
    }

    setOpen(false);
    router.push(`/dashboard/orders/${encodeURIComponent(result.data.id)}`);
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        className="rounded-md bg-brand-action text-white px-4 py-2 font-semibold shadow-lg shadow-black/20 hover:bg-amber-600 transition-colors"
        onClick={() => setOpen(true)}
      >
        立即下单
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => (pending ? null : setOpen(false))}
          />

          <div className="relative w-full max-w-lg rounded-xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="text-lg font-semibold text-white">下单前请描述需求</div>
            <div className="mt-2 text-sm text-slate-400">
              请描述您的具体需求、交付格式、参考风格、截止时间等。
            </div>

            <textarea
              className="mt-4 w-full border border-brand-border bg-black/20 rounded-md px-3 py-2 min-h-32 text-slate-200 placeholder:text-slate-600 focus:border-brand-action/50 focus:ring-2 focus:ring-brand-action/20 outline-none transition-all"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="请描述您的具体需求..."
            />

            {error ? (
              <div className="mt-3 rounded-md border border-red-900/50 bg-red-900/20 px-3 py-2 text-sm text-red-400 font-medium">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-brand-border px-4 py-2 text-sm font-semibold text-slate-400 hover:bg-white/5 transition-colors"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending || requirements.trim().length === 0}
                className="rounded-md bg-brand-action text-white px-4 py-2 text-sm font-semibold shadow-lg shadow-black/20 hover:bg-amber-600 disabled:opacity-60 transition-colors"
              >
                {pending ? "提交中..." : "确认下单"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
