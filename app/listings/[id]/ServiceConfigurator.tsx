"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createOrderAction } from "@/features/orders/actions";

export type ServiceOption = { label: string; price: number };

function formatMoney(v: number) {
  if (!Number.isFinite(v)) return "0";
  return String(Math.round(v));
}

export function ServiceConfigurator({
  listingId,
  basePrice,
  options,
}: {
  listingId: string;
  basePrice: number;
  options: ServiceOption[];
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<Record<number, boolean>>({});

  const selectedOptions = useMemo(() => {
    return options.filter((_, idx) => selected[idx]);
  }, [options, selected]);

  const total = useMemo(() => {
    const addOn = selectedOptions.reduce((acc, o) => acc + o.price, 0);
    return basePrice + addOn;
  }, [basePrice, selectedOptions]);

  const handleConfirm = async () => {
    setPending(true);
    setError(null);

    const result = await createOrderAction(listingId, requirements, selectedOptions);

    if (!result.success) {
      if (result.code === "UNAUTHORIZED") {
        router.push(`/login?redirectedFrom=${encodeURIComponent(`/listings/${listingId}`)}`);
        router.refresh();
        return;
      }

      setError(result.error);
      setPending(false);
      return;
    }

    setOpen(false);
    router.push(`/dashboard/orders/${encodeURIComponent(result.orderId)}`);
    router.refresh();
  };

  return (
    <div className="border border-indigo-100 rounded-xl p-5 bg-white shadow-lg font-inter">
      <div className="text-sm text-slate-500 font-medium">起步价格</div>
      <div className="mt-1 text-3xl font-jakarta font-extrabold text-slate-900">¥{formatMoney(basePrice)}</div>

      {options.length > 0 ? (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-sm font-bold text-slate-900 mb-4">增值选配</div>
          <div className="space-y-3">
            {options.map((opt, idx) => {
              const checked = Boolean(selected[idx]);
              return (
                <label key={idx} className="flex items-start justify-between gap-3 cursor-pointer group">
                  <span className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={(e) => {
                        setSelected((prev) => ({ ...prev, [idx]: e.target.checked }));
                      }}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{opt.label}</span>
                  </span>
                  <span className="text-sm font-semibold text-slate-900">+¥{formatMoney(opt.price)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">总计预计</div>
          <div className="text-2xl font-jakarta font-extrabold text-indigo-600">¥{formatMoney(total)}</div>
        </div>

        <button
          type="button"
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white px-6 py-3 font-bold shadow-md shadow-indigo-200"
          onClick={() => setOpen(true)}
        >
          立即下单
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => (pending ? null : setOpen(false))}
          />

          <div className="relative w-full max-w-lg rounded-xl border bg-white p-6 shadow-2xl">
            <div className="text-xl font-jakarta font-extrabold text-slate-900">填写下单需求</div>
            <div className="mt-2 text-sm text-slate-500">
              已选择 {selectedOptions.length} 个增值选项，总价 <span className="text-indigo-600 font-bold">¥{formatMoney(total)}</span>
            </div>

            <textarea
              className="mt-5 w-full border border-slate-200 rounded-xl px-4 py-3 min-h-32 text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="请描述您的具体需求、交付时间要求等..."
            />

            {error ? (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending || requirements.trim().length === 0}
                className="rounded-xl bg-indigo-600 text-white px-8 py-2.5 text-sm font-bold shadow-md shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                {pending ? "提交中..." : "确认下单"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
