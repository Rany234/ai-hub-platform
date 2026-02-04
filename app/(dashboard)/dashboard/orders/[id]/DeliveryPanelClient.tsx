"use client";

import { useMemo, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  approveDeliveryAction,
  createDeliveryAction,
  requestChangesAction,
} from "@/features/orders/actions";

type DeliveryRow = {
  id: string;
  order_id: string;
  content: string;
  file_url: string | null;
  created_at: string;
};

function randomString() {
  return Math.random().toString(36).slice(2);
}

function formatTime(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

function isImageUrl(url: string) {
  const u = url.toLowerCase();
  return (
    u.endsWith(".png") ||
    u.endsWith(".jpg") ||
    u.endsWith(".jpeg") ||
    u.endsWith(".gif") ||
    u.endsWith(".webp")
  );
}

export function DeliveryPanelClient({
  orderId,
  deliveries,
  isBuyer,
  isSeller,
  orderStatus,
  lastFeedback,
}: {
  orderId: string;
  deliveries: DeliveryRow[];
  isBuyer: boolean;
  isSeller: boolean;
  orderStatus: string;
  lastFeedback?: string;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState<string | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openFeedback, setOpenFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");

  const latest = deliveries[0];
  const canReview = isBuyer && orderStatus === "delivered" && Boolean(latest);

  const uploadFile = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const ext = file.name.split(".").pop() || "bin";
      const path = `public/${orderId}/${Date.now()}-${randomString()}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from("deliveries")
        .upload(path, file, {
          upsert: false,
          contentType: file.type || undefined,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      const publicUrl = supabase.storage
        .from("deliveries")
        .getPublicUrl(data.path).data.publicUrl;
      setFileUrl(publicUrl);
    } finally {
      setUploading(false);
    }
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    e.target.value = "";
  };

  const sendDelivery = async () => {
    setPending(true);
    setError(null);

    const result = await createDeliveryAction(orderId, content, fileUrl);
    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    window.location.reload();
  };

  const approve = async () => {
    setPending(true);
    setError(null);

    const result = await approveDeliveryAction(orderId);
    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    window.location.reload();
  };

  const requestChanges = async () => {
    setPending(true);
    setError(null);

    const result = await requestChangesAction(orderId, feedback);
    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    window.location.reload();
  };

  return (
    <div>
      <div className="text-sm font-semibold">交付记录</div>

      {deliveries.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">暂无交付记录。</p>
      ) : (
        <div className="mt-4 space-y-4">
          {deliveries.map((d, idx) => (
            <div key={d.id} className="relative pl-6">
              <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-gray-400" />
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="text-sm font-semibold">V{deliveries.length - idx} 交付</div>
                  <div className="text-xs text-muted-foreground">{formatTime(d.created_at)}</div>
                </div>
                <div className="mt-2 whitespace-pre-wrap text-sm">{d.content}</div>

                {d.file_url ? (
                  <div className="mt-3">
                    {isImageUrl(d.file_url) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt="delivery file"
                        src={d.file_url}
                        className="w-full max-h-64 object-cover rounded-md border"
                      />
                    ) : (
                      <a className="text-sm underline" href={d.file_url} target="_blank" rel="noreferrer">
                        下载附件
                      </a>
                    )}
                  </div>
                ) : null}

                {idx === 0 && orderStatus === "delivered" ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-md bg-black text-white px-4 py-2"
                      disabled={!canReview || pending}
                      onClick={approve}
                    >
                      ✅ 确认验收
                    </button>
                    <button
                      type="button"
                      className="rounded-md border px-4 py-2"
                      disabled={!canReview || pending}
                      onClick={() => setOpenFeedback(true)}
                    >
                      🔄 申请修改
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {error ? (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {/* Delivery form moved to bottom fold */}
      {isSeller && orderStatus !== "completed" ? (
        <details className="mt-8 border rounded-lg p-4">
          <summary className="cursor-pointer select-none text-sm font-semibold">
            新建交付
          </summary>

          <div className="mt-4">
            {lastFeedback ? (
              <div className="rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                买家上次修改意见：{lastFeedback}
              </div>
            ) : null}

            <div className="mt-4 space-y-1">
              <label className="text-sm" htmlFor="delivery_content_v">
                本次交付/更新说明
              </label>
              <textarea
                id="delivery_content_v"
                className="w-full border rounded-md px-3 py-2 min-h-28"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="本次交付/更新说明..."
              />
            </div>

            <div className="mt-4 space-y-2">
              <div className="text-sm">上传交付文件</div>
              <input
                ref={fileInputRef}
                type="file"
                className="block w-full text-sm"
                onChange={onFileChange}
              />
              {uploading ? (
                <div className="text-sm text-muted-foreground">上传中...</div>
              ) : null}
              {fileUrl ? (
                <a className="text-sm underline" href={fileUrl} target="_blank" rel="noreferrer">
                  已上传，点击查看
                </a>
              ) : null}
            </div>

            <button
              type="button"
              onClick={sendDelivery}
              disabled={pending || uploading || content.trim().length === 0}
              className="mt-4 rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
            >
              {pending ? "发送中..." : "发送交付"}
            </button>
          </div>
        </details>
      ) : null}

      {openFeedback ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => (pending ? null : setOpenFeedback(false))}
          />
          <div className="relative w-full max-w-lg rounded-xl border bg-white p-6">
            <div className="text-lg font-semibold">申请修改</div>
            <div className="mt-2 text-sm text-muted-foreground">
              请清晰描述需要修改的点，越具体越好。
            </div>

            <textarea
              className="mt-4 w-full border rounded-md px-3 py-2 min-h-28"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="请输入修改意见..."
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md border px-4 py-2"
                disabled={pending}
                onClick={() => setOpenFeedback(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
                disabled={pending || feedback.trim().length === 0}
                onClick={requestChanges}
              >
                {pending ? "提交中..." : "提交修改申请"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
