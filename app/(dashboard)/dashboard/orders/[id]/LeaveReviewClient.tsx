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
    <div className="border border-brand-border bg-brand-surface rounded-lg p-4 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">评价卖家</div>
          <div className="mt-1 text-sm text-slate-400">
            订单完成后可对本次服务进行评价。
          </div>
        </div>
        <button
          type="button"
          className="rounded-md bg-brand-action text-white px-4 py-2 font-semibold shadow-lg shadow-black/20 hover:bg-amber-600 transition-colors disabled:opacity-60"
          onClick={() => setOpen(true)}
        >
          去评价
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => (pending ? null : setOpen(false))}
          />
          <div className="relative w-full max-w-lg rounded-xl border border-brand-border bg-brand-surface p-6 shadow-2xl">
            <div className="text-lg font-semibold text-white">提交评价</div>

            <div className="mt-4">
              <div className="text-sm font-medium text-slate-200">评分</div>
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
                      <Star
                        className={
                          active
                            ? "h-5 w-5 fill-brand-action text-brand-action"
                            : "h-5 w-5 text-slate-600"
                        }
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <label className="text-sm font-medium text-slate-200" htmlFor="review_content">
                评论
              </label>
              <textarea
                id="review_content"
                className="w-full border border-brand-border bg-black/20 rounded-md px-3 py-2 min-h-28 text-slate-200 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-brand-action/20 focus:border-brand-action/50"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="说说你对本次服务的感受..."
              />
            </div>

            {error ? (
              <div className="mt-3 rounded-md border border-red-900/50 bg-red-900/20 px-3 py-2 text-sm text-red-400">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-3 rounded-md border border-green-900/50 bg-green-900/20 px-3 py-2 text-sm text-green-400">
                {success}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-md border border-brand-border px-4 py-2 text-slate-300 hover:bg-white/5 transition-colors"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                取消
              </button>
              <button
                type="button"
                className="rounded-md bg-brand-action text-white px-4 py-2 font-semibold shadow-lg shadow-black/20 hover:bg-amber-600 transition-colors disabled:opacity-60"
                disabled={pending || content.trim().length === 0}
                onClick={submit}
              >
                {pending ? "提交中..." : "提交评价"}
              </button>
            </div>

            {reviewCreatedAt ? (
              <div className="mt-4 text-xs text-slate-500">提交时间：{formatTime(reviewCreatedAt)}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
