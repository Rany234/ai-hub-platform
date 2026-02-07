"use client";

import { useMemo, useRef, useState } from "react";

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

function randomString() {
  return Math.random().toString(36).slice(2);
}

export function ListingForm({ mode = "create", initialData }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [createState, setCreateState] = useState<CreateState>({});
  const [editState, setEditState] = useState<EditState>({});
  const [pending, setPending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fields we want to live-preview
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [price, setPrice] = useState(String(initialData?.price ?? ""));
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState<"prompt" | "workflow" | "image_set">(
    (initialData?.category as any) ?? "prompt"
  );
  const [previewUrl, setPreviewUrl] = useState(initialData?.preview_url ?? "");
  const [deliveryDays, setDeliveryDays] = useState(
    ((initialData?.metadata as any)?.delivery_days as number) ?? 3
  );

  const [options, setOptions] = useState<Array<{ label: string; price: string }>>(
    ((initialData?.options as any) ?? []).map((o: any) => ({
      label: o.label ?? "",
      price: String(o.price ?? ""),
    }))
  );

  const onSubmit = async (formData: FormData) => {
    setPending(true);

    const cleaned = options
      .map((o) => ({
        label: o.label.trim(),
        price: Number(o.price),
      }))
      .filter((o) => o.label.length > 0 && Number.isFinite(o.price) && o.price >= 0);

    formData.set("options", JSON.stringify(cleaned));

    let result;
    if (mode === "edit" && initialData?.id) {
      formData.set("id", initialData.id);
      result = await updateListing(null, formData);
      setEditState(result);
    } else {
      result = await createListing(null, formData);
      setCreateState(result);
    }

    setPending(false);
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

      const { data, error } = await supabase.storage
        .from("listings")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || undefined,
        });

      if (error) {
        setCreateState({ success: false, error: "上传失败，请稍后重试" });
        setEditState({ success: false, error: "上传失败，请稍后重试" });
        return;
      }

      const publicUrl = supabase.storage
        .from("listings")
        .getPublicUrl(data.path).data.publicUrl;
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
    const listing: Listing = {
      id: "preview",
      created_at: new Date().toISOString(),
      creator_id: "preview",
      title: title || "（未填写服务标题）",
      description: description || null,
      price: Number.isFinite(Number(price)) ? Number(price) : 0,
      category: category ?? null,
      metadata: { delivery_days: deliveryDays } as unknown as Listing["metadata"],
      preview_url: previewUrl || null,
      options: [],
      status: "active",
    };
    return listing;
  }, [title, price, description, category, previewUrl, deliveryDays]);

  const state = mode === "edit" ? editState : createState;
  const successMessage = mode === "edit" ? "更新成功" : "发布成功";

  return (
    <div className="w-full max-w-5xl mx-auto min-h-[calc(100vh-8rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <h1 className="text-2xl font-semibold">{mode === "edit" ? "编辑服务" : "发布服务"}</h1>

            {state.success === false ? (
              <p className="mt-2 text-sm text-red-600">{state.error}</p>
            ) : null}
            {state.success === true ? (
              <p className="mt-2 text-sm text-green-700">
                {successMessage}
                {mode === "create" && typeof state.data?.id === "string" ? `：${state.data.id}` : ""}
              </p>
            ) : null}

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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-sm" htmlFor="price">
                      服务价格
                    </label>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      required
                      className="w-full border rounded-md px-3 py-2"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm" htmlFor="delivery_days">
                      预计交付（天）
                    </label>
                    <input
                      id="delivery_days"
                      name="delivery_days"
                      type="number"
                      min={1}
                      step={1}
                      required
                      className="w-full border rounded-md px-3 py-2"
                      value={deliveryDays}
                      onChange={(e) => setDeliveryDays(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm">服务封面 / 案例展示</label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />

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
                <h2 className="text-sm font-semibold text-muted-foreground">增值服务配置</h2>

                <div className="space-y-3">
                  {options.length === 0 ? (
                    <p className="text-sm text-muted-foreground">暂无增值选项。</p>
                  ) : null}

                  {options.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-sm" htmlFor={`opt_label_${idx}`}>
                          选项名称
                        </label>
                        <input
                          id={`opt_label_${idx}`}
                          className="w-full border rounded-md px-3 py-2"
                          value={opt.label}
                          onChange={(e) => {
                            const next = options.slice();
                            next[idx] = { ...next[idx], label: e.target.value };
                            setOptions(next);
                          }}
                          placeholder="例如：提供源文件"
                        />
                      </div>

                      <div className="sm:col-span-1 space-y-1">
                        <label className="text-sm" htmlFor={`opt_price_${idx}`}>
                          额外价格
                        </label>
                        <input
                          id={`opt_price_${idx}`}
                          type="number"
                          step="1"
                          min={0}
                          className="w-full border rounded-md px-3 py-2"
                          value={opt.price}
                          onChange={(e) => {
                            const next = options.slice();
                            next[idx] = { ...next[idx], price: e.target.value };
                            setOptions(next);
                          }}
                          placeholder="0"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <button
                          type="button"
                          className="w-full rounded-md border px-3 py-2"
                          onClick={() => {
                            setOptions(options.filter((_, i) => i !== idx));
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="rounded-md bg-black text-white px-4 py-2"
                    onClick={() => setOptions([...options, { label: "", price: "" }])}
                  >
                    + 添加选项
                  </button>
                </div>
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
                className="w-full rounded-md bg-black text-white py-2 disabled:opacity-60"
              >
                {isUploading ? "上传中..." : pending ? (mode === "edit" ? "更新中..." : "发布中...") : (mode === "edit" ? "更新服务" : "发布服务")}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="md:sticky md:top-6">
            <div className="mb-3 text-sm font-semibold text-muted-foreground">实时预览</div>
            <ListingCard listing={previewListing} />
          </div>
        </div>
      </div>
    </div>
  );
}