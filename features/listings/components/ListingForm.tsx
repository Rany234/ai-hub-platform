"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createListing, updateListing } from "@/features/listings/actions";
import { ListingCard, type Listing } from "@/features/listings/components/ListingCard";
import type { ListingPackages, PackageTierKey as NormalizedTierKey } from "@/types/supabase";

type CreateState =
  | { success?: undefined; data?: undefined; error?: undefined }
  | { success: true; data: { id: string }; error?: undefined }
  | { success: false; error: string; data?: undefined };

type EditState =
  | { success?: undefined; data?: undefined; error?: undefined }
  | { success: true; data: null; error?: undefined }
  | { success: false; error: string; data?: undefined };

type Props = {
  mode?: "create" | "edit";
  initialData?: Listing | null;
};

type PackageTierKey = NormalizedTierKey;

type ListingPackageDraft = {
  enabled: boolean;
  price: string;
  delivery_days: number;
  features: string[];
};

type ListingPackagesDraft = Record<PackageTierKey, ListingPackageDraft>;

function randomString() {
  return Math.random().toString(36).slice(2);
}

const TIER_META: Array<{ key: PackageTierKey; title: string; subtitle: string }> = [
  { key: "basic", title: "Basic", subtitle: "基础版" },
  { key: "standard", title: "Standard", subtitle: "标准版" },
  { key: "premium", title: "Premium", subtitle: "高级版" },
];

const DEFAULT_FEATURES = [
  "提供源代码",
  "支持商用",
  "含部署指导",
  "提供文档",
  "一次修改机会",
  "优先响应",
];

const BASE_MODELS = [
  "GPT-4",
  "Claude 3.5 Sonnet",
  "Midjourney v6",
  "Stable Diffusion XL",
  "DALL-E 3",
  "Llama 3",
  "Other"
];

function clampInt(n: number, min: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.trunc(n));
}

function parseExistingPackages(initialData: Listing | null | undefined): ListingPackagesDraft {
  const rawPackages = (initialData as any)?.packages as any;
  const raw =
    rawPackages && typeof rawPackages === "object"
      ? Object.entries(rawPackages).reduce<Record<string, any>>((acc, [key, value]) => {
          acc[key.toLowerCase()] = value;
          return acc;
        }, {})
      : rawPackages;

  const fallback: ListingPackagesDraft = {
    basic: { enabled: true, price: "", delivery_days: 3, features: [] },
    standard: { enabled: true, price: "", delivery_days: 3, features: [] },
    premium: { enabled: true, price: "", delivery_days: 3, features: [] },
  };

  if (!raw || typeof raw !== "object") return fallback;

  const next = { ...fallback } as ListingPackagesDraft;

  (Object.keys(next) as PackageTierKey[]).forEach((k) => {
    const p = raw[k];
    if (!p || typeof p !== "object") return;
    next[k] = {
      enabled: p.enabled !== false,
      price: typeof p.price === "number" ? String(p.price) : typeof p.price === "string" ? p.price : "",
      delivery_days: clampInt(Number(p.delivery_days ?? 3), 1),
      features: Array.isArray(p.features) ? p.features.filter((x: any) => typeof x === "string") : [],
    };
  });

  next.basic.enabled = true;

  return next;
}

export function ListingForm({ mode = "create", initialData }: Props) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createState, setCreateState] = useState<CreateState>({});
  const [editState, setEditState] = useState<EditState>({});
  const [pending, setPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isOathed, setIsOathed] = useState(false);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [mainCategory, setMainCategory] = useState<"assets" | "services" | "solutions">(
    ((initialData?.category as any) as "assets" | "services" | "solutions") ?? "assets"
  );

  const [subCategory, setSubCategory] = useState<string>(() => {
    const fromMeta = (initialData?.metadata as any)?.sub_category;
    return typeof fromMeta === "string" && fromMeta.length > 0 ? fromMeta : "prompt";
  });
  const [previewUrl, setPreviewUrl] = useState(initialData?.preview_url ?? "");

  const [packages, setPackages] = useState<ListingPackagesDraft>(() => parseExistingPackages(initialData));
  const [previewTier, setPreviewTier] = useState<PackageTierKey>("basic");

  const onSubmit = async (formData: FormData) => {
    if (pending) return;
    setPending(true);

    const payload = {
      basic: {
        enabled: true,
        price: Number(packages.basic.price),
        delivery_days: packages.basic.delivery_days,
        features: packages.basic.features,
      },
      standard: {
        enabled: packages.standard.enabled,
        price: Number(packages.standard.price),
        delivery_days: packages.standard.delivery_days,
        features: packages.standard.features,
      },
      premium: {
        enabled: packages.premium.enabled,
        price: Number(packages.premium.price),
        delivery_days: packages.premium.delivery_days,
        features: packages.premium.features,
      },
    };

    const normalizedPackages = Object.entries(payload as unknown as Record<string, any>).reduce((acc, [key, value]) => {
      acc[key.toLowerCase() as PackageTierKey] = value;
      return acc;
    }, {} as ListingPackages);

    formData.set("packages", JSON.stringify(normalizedPackages));

    try {
      let result;
      if (mode === "edit" && initialData?.id) {
        formData.set("id", initialData.id);
        result = await updateListing(null, formData);
        setEditState(result);
      } else {
        result = await createListing(null, formData);
        setCreateState(result);
      }

      if (!result.success) {
        console.error("Listing submission failed:", result.error);
        toast.error(result.error || "发布失败，请检查数据库字段");
        return;
      }

      toast.success(mode === "edit" ? "更新成功！" : "服务发布成功！");
      router.refresh();
      router.push("/dashboard/services");
    } catch (err) {
      console.error("Listing submission exception:", err);
      toast.error("提交失败，请稍后重试");
    } finally {
      setPending(false);
    }
  };

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setCreateState({});
    setEditState({});

    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `public/${Date.now()}-${randomString()}.${ext}`;

      const { data, error } = await supabase.storage.from("listings").upload(path, file, {
        upsert: false,
        contentType: file.type || undefined,
      });

      if (error) {
        setCreateState({ success: false, error: "上传失败，请稍后重试" });
        setEditState({ success: false, error: "上传失败，请稍后重试" });
        return;
      }

      const publicUrl = supabase.storage.from("listings").getPublicUrl(data.path).data.publicUrl;
      setPreviewUrl(publicUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCreateState({ success: false, error: "请上传图片文件" });
      setEditState({ success: false, error: "请上传图片文件" });
      return;
    }
    await uploadFile(file);
  };

  const previewListing = useMemo(() => {
    const tier = packages[previewTier];

    const listing: Listing = {
      id: "preview",
      created_at: new Date().toISOString(),
      creator_id: "preview",
      title: title || "（未填写服务标题）",
      description: description || null,
      price: Number.isFinite(Number(tier.price)) ? Number(tier.price) : 0,
      category: category ?? null,
      metadata: { delivery_days: tier.delivery_days } as unknown as Listing["metadata"],
      preview_url: previewUrl || null,
      options: [],
      status: "active",
    } as any;

    (listing as any).packages = packages;
    return listing;
  }, [title, description, category, previewUrl, packages, previewTier]);

  const state = mode === "edit" ? editState : createState;

  const renderTierCard = (key: PackageTierKey) => {
    const t = packages[key];
    const meta = TIER_META.find((x) => x.key === key)!;

    return (
      <div className={`border border-[#334155] rounded-xl p-4 bg-[#151F32] ${!t.enabled ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-semibold">{meta.title}</div>
            <div className="text-xs text-muted-foreground">{meta.subtitle}</div>
          </div>

          {key === "basic" ? (
            <div className="text-xs text-muted-foreground">必选</div>
          ) : (
            <label className="flex items-center gap-2 text-xs select-none">
              <input
                type="checkbox"
                checked={t.enabled}
                onChange={(e) => {
                  const enabled = e.target.checked;
                  setPackages((prev) => ({
                    ...prev,
                    [key]: { ...prev[key], enabled },
                  }));
                }}
              />
              启用
            </label>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div className="space-y-1">
            <label className="text-sm" htmlFor={`price_${key}`}>
              价格
            </label>
            <input
              id={`price_${key}`}
              type="number"
              step="0.01"
              min={0}
              disabled={!t.enabled}
              className="w-full bg-[#0B1121] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
              value={t.price}
              onChange={(e) => {
                const value = e.target.value;
                setPackages((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], price: value },
                }));
              }}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm" htmlFor={`delivery_${key}`}>
              预计交付（天）
            </label>
            <input
              id={`delivery_${key}`}
              type="number"
              min={1}
              step={1}
              disabled={!t.enabled}
              className="w-full bg-[#0B1121] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
              value={t.delivery_days}
              onChange={(e) => {
                const value = clampInt(Number(e.target.value), 1);
                setPackages((prev) => ({
                  ...prev,
                  [key]: { ...prev[key], delivery_days: value },
                }));
              }}
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm">包含内容</div>

            <div className="space-y-2">
              {DEFAULT_FEATURES.map((f) => {
                const checked = t.features.includes(f);
                return (
                  <label key={`${key}_${f}`} className="flex items-center gap-2 text-sm select-none">
                    <input
                      type="checkbox"
                      disabled={!t.enabled}
                      checked={checked}
                      onChange={(e) => {
                        const nextChecked = e.target.checked;
                        setPackages((prev) => {
                          const curr = prev[key].features;
                          const nextFeatures = nextChecked
                            ? Array.from(new Set([...curr, f]))
                            : curr.filter((x) => x !== f);
                          return {
                            ...prev,
                            [key]: { ...prev[key], features: nextFeatures },
                          };
                        });
                      }}
                    />
                    {f}
                  </label>
                );
              })}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              console.log("Switching to tier:", key);
              setPreviewTier(key);
            }}
            disabled={!t.enabled}
          >
            预览此套餐
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-[#151F32] border border-[#334155] rounded-2xl p-6 shadow-2xl">
            <h1 className="text-2xl font-semibold">{mode === "edit" ? "编辑服务" : "发布服务"}</h1>

            {state.success === false ? <p className="mt-2 text-sm text-red-600">{state.error}</p> : null}

            <form action={onSubmit} className="mt-6 space-y-8">
              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">基本信息</h2>

                <div className="space-y-1">
                  <label className="text-sm" htmlFor="title">
                    服务标题
                  </label>
                  <input
                    id="title"
                    name="title"
                    required
                    className="w-full bg-[#0B1121] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-sm" htmlFor="description">
                    服务介绍
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    className="w-full border rounded-md px-3 py-2 min-h-24"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm">服务封面 / 案例展示</label>

                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

                  <div
                    className="border-2 border-dashed border-slate-600 bg-transparent rounded-xl p-8 text-center cursor-pointer select-none hover:border-brand-action/50 hover:bg-white/5 transition-all"
                    onClick={onPickFile}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                  >
                    <p className="text-sm text-slate-400">{isUploading ? "上传中..." : "点击或拖拽上传服务封面"}</p>
                  </div>

                  <input type="hidden" name="previewUrl" value={previewUrl} />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">三段式套餐</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{TIER_META.map((t) => renderTierCard(t.key))}</div>
              </section>

              {/* --- 新增：共创信息模块 --- */}
              <div className="space-y-4 border-t border-white/10 pt-6 mt-6">
                <h3 className="text-lg font-medium text-slate-200">共创声明 (Co-Creation)</h3>
                <p className="text-sm text-slate-500">根据《共生纪元》契约，请如实标注 AI 贡献与灵感来源。</p>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm text-slate-300" htmlFor="base_model">
                      协创模型 (Co-Pilot)
                    </label>
                    <select
                      id="base_model"
                      name="base_model"
                      defaultValue={(initialData as any)?.base_model ?? "GPT-4"}
                      className="w-full bg-[#0B1121] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
                    >
                      {BASE_MODELS.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300" htmlFor="credits">
                      灵感致谢 (Credits)
                    </label>
                    <textarea
                      id="credits"
                      name="credits"
                      defaultValue={(initialData as any)?.credits ?? ""}
                      placeholder="例如：灵感来源于 Github @user 的开源项目..."
                      className="w-full bg-[#0B1121] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all min-h-[80px]"
                    />
                  </div>
                </div>
              </div>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">服务分类</h2>

                <div className="space-y-3">
                  <div className="text-sm text-slate-300">主分类</div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setMainCategory("assets")}
                      className={`text-left rounded-2xl border p-4 transition-all backdrop-blur ${
                        mainCategory === "assets"
                          ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-sm font-extrabold text-white">AI 数字资产</div>
                      <div className="mt-1 text-xs text-slate-400">适合可下载/可复用的交付物</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMainCategory("services")}
                      className={`text-left rounded-2xl border p-4 transition-all backdrop-blur ${
                        mainCategory === "services"
                          ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-sm font-extrabold text-white">定制化服务</div>
                      <div className="mt-1 text-xs text-slate-400">适合一对一调试、创作与交付</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMainCategory("solutions")}
                      className={`text-left rounded-2xl border p-4 transition-all backdrop-blur ${
                        mainCategory === "solutions"
                          ? "border-amber-500/30 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className="text-sm font-extrabold text-white">企业级解决方案</div>
                      <div className="mt-1 text-xs text-slate-400">适合端到端交付与工程化落地</div>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-slate-300" htmlFor="category">
                      细分类
                    </label>

                    <select
                      id="category"
                      name="category"
                      className="w-full bg-[#0B1121] border border-[#334155] rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50 transition-all"
                      value={subCategory}
                      onChange={(e) => setSubCategory(e.target.value)}
                    >
                      {mainCategory === "assets" ? (
                        <>
                          <option value="prompt">Prompt / 提示词</option>
                          <option value="image_set">Image Set / 图集素材</option>
                          <option value="workflow">Workflow / 工作流</option>
                          <option value="lora">LoRA Model / LoRA 模型</option>
                        </>
                      ) : null}

                      {mainCategory === "services" ? (
                        <>
                          <option value="custom_design">Custom Design / 定制设计</option>
                          <option value="consulting">Consulting / 咨询服务</option>
                          <option value="model_training">Model Training / 模型训练</option>
                        </>
                      ) : null}

                      {mainCategory === "solutions" ? (
                        <>
                          <option value="agent_dev">Agent Development / Agent 开发</option>
                          <option value="knowledge_base">Knowledge Base / 知识库</option>
                          <option value="saas_integration">SaaS Integration / 系统集成</option>
                        </>
                      ) : null}
                    </select>

                    <input type="hidden" name="mainCategory" value={mainCategory} />
                    <input type="hidden" name="subCategory" value={subCategory} />
                  </div>
                </div>
              </section>

              {/* --- 新增：共生契约宣誓 --- */}
              <div className="rounded-xl border border-amber-500/20 bg-amber-900/10 p-5 mt-8">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center mt-1">
                    <input
                      type="checkbox"
                      required
                      checked={isOathed}
                      onChange={(e) => setIsOathed(e.target.checked)}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-amber-500/30 bg-black/40 checked:bg-amber-500 checked:border-amber-500 transition-all focus:ring-2 focus:ring-amber-500/20 outline-none"
                    />
                    <svg
                      className="absolute h-3.5 w-3.5 pointer-events-none hidden peer-checked:block left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-1">
                    <span className="block text-sm font-semibold text-amber-200 group-hover:text-amber-100 transition-colors">
                      我已阅读并认同《共生纪元》契约
                    </span>
                    <p className="text-xs text-amber-500/70 leading-relaxed">
                      我承诺在此次服务发布中尊重原创、如实标注 AI 贡献，并愿意共同维护公平、透明的共生交易生态。
                    </p>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                disabled={pending || isUploading || !isOathed}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white py-3 font-bold shadow-lg shadow-amber-900/20 disabled:opacity-60 flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-500 transition-colors"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>上传中...</span>
                  </>
                ) : pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{mode === "edit" ? "更新中..." : "发布中..."}</span>
                  </>
                ) : mode === "edit" ? (
                  "保存修改"
                ) : (
                  "发布服务"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="md:sticky md:top-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-muted-foreground">实时预览</div>
              <div className="flex items-center gap-1">
                {TIER_META.map((t) => {
                  const enabled = packages[t.key].enabled;
                  const active = previewTier === t.key;
                  return (
                    <button
                      key={`preview_${t.key}`}
                      type="button"
                      className={`rounded-md border border-[#334155] px-2 py-1 text-xs transition-colors ${
                        active ? "bg-brand-action text-white border-brand-action/30" : "bg-[#151F32] text-slate-300 hover:bg-white/5"
                      } ${!enabled ? "opacity-50" : ""}`}
                      onClick={() => setPreviewTier(t.key)}
                      disabled={!enabled}
                    >
                      {t.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <ListingCard key={previewTier} listing={previewListing} />
          </div>
        </div>
      </div>
    </div>
  );
}
