"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, RefreshCcw } from "lucide-react";

const FALLBACK_PACKAGE = {
  enabled: true,
  price: 0,
  delivery_days: 3,
  revisions: 1,
  features: [] as string[],
};

import { createOrderAction } from "@/features/orders/actions";
import type { ListingPackages, PackageTierKey } from "@/types/supabase";

export type ServiceOption = { label: string; price: number };

function formatMoney(v: number) {
  if (!Number.isFinite(v)) return "0";
  return String(Math.round(v));
}

const TIER_LABELS: Record<PackageTierKey, { title: string; subtitle: string }> = {
  basic: { title: "Basic", subtitle: "基础版" },
  standard: { title: "Standard", subtitle: "标准版" },
  premium: { title: "Premium", subtitle: "高级版" },
};

export function ServiceConfigurator({
  listingId,
  basePrice: fallbackPrice,
  options,
  packages: rawPackages,
}: {
  listingId: string;
  basePrice: number;
  options: ServiceOption[];
  packages?: any;
}) {
  const router = useRouter();

  // 数据清洗：统一转小写 Key
  const packages = useMemo(() => {
    if (!rawPackages || typeof rawPackages !== "object") return null;
    return Object.entries(rawPackages).reduce((acc, [key, value]) => {
      acc[key.toLowerCase() as PackageTierKey] = value;
      return acc;
    }, {} as any) as ListingPackages;
  }, [rawPackages]);

  // 状态管理
  const [selectedTier, setSelectedTier] = useState<PackageTierKey>("basic");
  const [open, setOpen] = useState(false);
  const [requirements, setRequirements] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, boolean>>({});

  // 获取当前选中套餐数据
  const currentPackage = useMemo(() => {
    if (!packages) return FALLBACK_PACKAGE;
    const p = (packages as any)?.[selectedTier];
    if (!p || typeof p !== "object") return FALLBACK_PACKAGE;
    return {
      ...FALLBACK_PACKAGE,
      ...p,
      // 兼容 price 为 string 的情况
      price: typeof p.price === "number" ? p.price : typeof p.price === "string" ? Number(p.price) : FALLBACK_PACKAGE.price,
    };
  }, [packages, selectedTier]);

  // 获取所有可用的套餐 Key
  const enabledTiers = useMemo(() => {
    if (!packages) return ["basic"] as PackageTierKey[];
    return (Object.keys(TIER_LABELS) as PackageTierKey[]).filter((key) => {
      if (key === "basic") return true;
      const enabled = (packages as any)?.[key]?.enabled;
      return enabled !== false;
    });
  }, [packages]);

  const activeOptions = useMemo(() => {
    return options.filter((_, idx) => selectedOptions[idx]);
  }, [options, selectedOptions]);

  const basePrice = currentPackage?.price ?? fallbackPrice;
  const total = useMemo(() => {
    const addOn = activeOptions.reduce((acc, o) => acc + o.price, 0);
    return basePrice + addOn;
  }, [basePrice, activeOptions]);

  const handleConfirm = async () => {
    setPending(true);
    setError(null);

    // 下单时带上 selectedTier
    const result = await createOrderAction(listingId, requirements, activeOptions, {
      tier: selectedTier,
      packageDetails: currentPackage
    });

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
      {/* 套餐切换器 */}
      <div className="mb-6 flex p-1 bg-slate-100 rounded-xl">
        {enabledTiers.map((tier) => {
          const active = selectedTier === tier;
          return (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                active
                  ? "bg-white text-indigo-600 shadow-sm scale-[1.02]"
                  : "text-gray-500 hover:text-slate-700"
              }`}
            >
              <div className="text-[10px] uppercase opacity-60 leading-none mb-0.5">
                {TIER_LABELS[tier].title}
              </div>
              <div>{TIER_LABELS[tier].subtitle}</div>
            </button>
          );
        })}
      </div>

      {/* 价格与基本信息 */}
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-jakarta font-extrabold text-slate-900" suppressHydrationWarning>
          ¥{formatMoney(basePrice)}
        </div>
      </div>

      {/* 交付 / 修改次数信息栏 */}
      <div className="mt-4 bg-slate-50 rounded-lg p-3 flex justify-between items-center" suppressHydrationWarning>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span>{currentPackage.delivery_days} 天交付</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <RefreshCcw className="w-4 h-4 text-indigo-500" />
          <span>
            {(() => {
              const r = currentPackage.revisions;
              if (typeof r !== "number") return "无限次修改";
              if (r === -1) return "无限次修改";
              if (r === 0) return "无修改服务";
              return `${r} 次修改`;
            })()}
          </span>
        </div>
      </div>

      {/* 套餐功能列表 */}
      <div className="mt-6 space-y-3">
        {(currentPackage?.features ?? []).map((feature: string, i: number) => (
          <div key={i} className="flex items-center gap-2.5 text-sm text-slate-600">
            <Check className="h-4 w-4 text-emerald-500 flex-shrink-0" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      {/* 增值选配 */}
      {options.length > 0 ? (
        <div className="mt-6 pt-6 border-t border-slate-100">
          <div className="text-sm font-bold text-slate-900 mb-4">增值选配</div>
          <div className="space-y-3">
            {options.map((opt, idx) => {
              const checked = Boolean(selectedOptions[idx]);
              return (
                <label key={idx} className="flex items-start justify-between gap-3 cursor-pointer group">
                  <span className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedOptions((prev) => ({ ...prev, [idx]: e.target.checked }));
                      }}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {opt.label}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-slate-900">+¥{formatMoney(opt.price)}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 总计与下单 */}
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

      {/* 下单弹窗 */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => (pending ? null : setOpen(false))}
          />

          <div className="relative w-full max-w-lg rounded-xl border bg-white p-6 shadow-2xl">
            <div className="text-xl font-jakarta font-extrabold text-slate-900">填写下单需求</div>
            <div className="mt-2 text-sm text-slate-500">
              已选 <span className="font-bold text-slate-900">{TIER_LABELS[selectedTier].subtitle}</span>
              {activeOptions.length > 0 && ` + ${activeOptions.length} 个增值选项`}
              ，总价 <span className="text-indigo-600 font-bold">¥{formatMoney(total)}</span>
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

