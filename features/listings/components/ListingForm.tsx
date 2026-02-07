"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { createListing, updateListing } from "@/features/listings/actions";
import { ListingCard, type Listing } from "@/features/listings/components/ListingCard";

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

type PackageTierKey = "basic" | "standard" | "premium";

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

function clampInt(n: number, min: number) {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.trunc(n));
}

function parseExistingPackages(initialData: Listing | null | undefined): ListingPackagesDraft {
  const raw = (initialData as any)?.packages as any;

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

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState<"prompt" | "workflow" | "image_set">(
    (initialData?.category as any) ?? "prompt"
  );
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

    formData.set("packages", JSON.stringify(payload));

    let result;
    if (mode === "edit" && initialData?.id) {
      formData.set("id", initialData.id);
      result = await updateListing(null, formData);
      setEditState(result);
    } else {
      result = await createListing(null, formData);
      setCreateState(result);
    }

    if (result.success) {
      toast.success(mode === "edit" ? "更新成功！" : "服务发布成功！");
      router.refresh();
      router.push("/dashboard/services");
    } else {
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
      metadata: { delivery_days: tier.delivery_days, packages } as unknown as Listing["metadata"],
      preview_url: previewUrl || null,
      options: [],
      status: "active",
    };
    return listing;
  }, [title, description, category, previewUrl, packages, previewTier]);

  const state = mode === "edit" ? editState : createState;

  const renderTierCard = (key: PackageTierKey) => {
    const t = packages[key];
    const meta = TIER_META.find((x) => x.key === key)!;

    return (
      <div className={`border rounded-xl p-4 bg-white ${!t.enabled ? "opacity-60" : ""}`}>
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
              className="w-full border rounded-md px-3 py-2"
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
              className="w-full border rounded-md px-3 py-2"
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

          <button
            type="button"
            className="w-full rounded-md border px-3 py-2"
            onClick={() => setPreviewTier(key)}
            disabled={!t.enabled}
          >
            预览此套餐
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
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
                    className="w-full border rounded-md px-3 py-2"
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
                    className="border rounded-lg p-6 text-center cursor-pointer select-none"
                    onClick={onPickFile}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                  >
                    <p className="text-sm">{isUploading ? "上传中..." : "点击或拖拽上传服务封面"}</p>
                  </div>

                  <input type="hidden" name="previewUrl" value={previewUrl} />
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">三段式套餐</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{TIER_META.map((t) => renderTierCard(t.key))}</div>
              </section>

              <section className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground">服务分类</h2>

                <div className="space-y-1">
                  <label className="text-sm" htmlFor="category">
                    分类
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="w-full border rounded-md px-3 py-2"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as "prompt" | "workflow" | "image_set")}
                  >
                    <option value="prompt">定制提示词</option>
                    <option value="workflow">工作流搭建</option>
                    <option value="image_set">图集定制</option>
                  </select>
                </div>
              </section>

              <button
                type="submit"
                disabled={pending || isUploading}
                className="w-full rounded-md bg-black text-white py-2 disabled:opacity-60 flex items-center justify-center gap-2"
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
                  "更新服务"
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
                      className={`rounded-md border px-2 py-1 text-xs ${active ? "bg-black text-white" : "bg-white"} ${!enabled ? "opacity-50" : ""}`}
                      onClick={() => setPreviewTier(t.key)}
                      disabled={!enabled}
                    >
                      {t.title}
                    </button>
                  );
                })}
              </div>
            </div>
            <ListingCard listing={previewListing} />
          </div>
        </div>
      </div>
    </div>
  );
}
