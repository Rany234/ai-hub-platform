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
    <div className="border rounded-lg p-4">
      <div className="text-sm text-muted-foreground">基础价格</div>
      <div className="mt-1 text-2xl font-semibold">¥{formatMoney(basePrice)}</div>

      {options.length > 0 ? (
        <div className="mt-5">
          <div className="text-sm font-semibold">增值选配</div>
          <div className="mt-3 space-y-3">
            {options.map((opt, idx) => {
              const checked = Boolean(selected[idx]);
              return (
                <label key={idx} className="flex items-start justify-between gap-3 cursor-pointer">
                  <span className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={(e) => {
                        setSelected((prev) => ({ ...prev, [idx]: e.target.checked }));
                      }}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </span>
                  <span className="text-sm font-medium">+¥{formatMoney(opt.price)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center justify-between">
        <div>
          <div className="text-sm text-muted-foreground">Total</div>
          <div className="text-xl font-semibold">¥{formatMoney(total)}</div>
        </div>

        <button
          type="button"
          className="rounded-md bg-black text-white px-4 py-2"
          onClick={() => setOpen(true)}
        >
          ¥{formatMoney(total)} 立即下单
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => (pending ? null : setOpen(false))}
          />

          <div className="relative w-full max-w-lg rounded-xl border bg-white p-6">
            <div className="text-lg font-semibold">下单前请描述需求</div>
            <div className="mt-2 text-sm text-muted-foreground">
              已选择 {selectedOptions.length} 个增值选项，总价 ¥{formatMoney(total)}。
            </div>

            <textarea
              className="mt-4 w-full border rounded-md px-3 py-2 min-h-32"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="请描述您的具体需求..."
            />

            {error ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md border px-4 py-2"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                取消
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={pending || requirements.trim().length === 0}
                className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
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
