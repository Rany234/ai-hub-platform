"use client";

import { useMemo, useState } from "react";
import { Star } from "lucide-react";

import { createReviewAction } from "@/features/reviews/actions";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

function formatTime(ts: string) {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return ts;
  return d.toLocaleString();
}

type Props = {
  orderId: string;
};

export function LeaveReviewClient({ orderId }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [reviewCreatedAt, setReviewCreatedAt] = useState<string | null>(null);

  async function submit() {
    setPending(true);
    setError(null);
    setSuccess(null);

    const result = await createReviewAction({ orderId, rating, content });
    if (!result.success) {
      setError(result.error);
      setPending(false);
      return;
    }

    setSuccess("评价已提交");
    setReviewCreatedAt(new Date().toISOString());

    setTimeout(() => {
      setOpen(false);
    }, 600);

    setPending(false);
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold">评价卖家</div>
          <div className="mt-1 text-sm text-muted-foreground">
            订单完成后可对本次服务进行评价。
          </div>
        </div>
        <button
          type="button"
          className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
          onClick={() => setOpen(true)}
        >
          去评价
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => (pending ? null : setOpen(false))} />
          <div className="relative w-full max-w-lg rounded-xl border bg-white p-6">
            <div className="text-lg font-semibold">提交评价</div>

            <div className="mt-4">
              <div className="text-sm font-medium">评分</div>
              <div className="mt-2 flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, idx) => {
                  const v = idx + 1;
                  const active = v <= rating;
                  return (
                    <button
                      key={v}
                      type="button"
                      className="p-1"
                      onClick={() => setRating(v)}
                      aria-label={`rate ${v}`}
                    >
                      <Star className={active ? "h-5 w-5 fill-black" : "h-5 w-5"} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium" htmlFor="review_content">
                评论
              </label>
              <textarea
                id="review_content"
                className="w-full border rounded-md px-3 py-2 min-h-28"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="说说你对本次服务的感受..."
              />
            </div>

            {error ? (
              <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
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
                className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
                disabled={pending || content.trim().length === 0}
                onClick={submit}
              >
                {pending ? "提交中..." : "提交评价"}
              </button>
            </div>

            {reviewCreatedAt ? (
              <div className="mt-4 text-xs text-muted-foreground">提交时间：{formatTime(reviewCreatedAt)}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
