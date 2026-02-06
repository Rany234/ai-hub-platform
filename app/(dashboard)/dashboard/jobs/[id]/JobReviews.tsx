"use client";

import { useMemo, useState, useTransition } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { submitReview } from "@/app/actions/reviews";

type ReviewRow = {
  id: string;
  job_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

function StarsInput({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const n = i + 1;
        const active = n <= value;
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange(n)}
            className="p-1"
            aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
          >
            <Star className={active ? "h-5 w-5 fill-yellow-400 text-yellow-400" : "h-5 w-5 text-muted-foreground"} />
          </button>
        );
      })}
    </div>
  );
}

function ReviewCard({ title, review }: { title: string; review: ReviewRow }) {
  return (
    <div className="rounded-xl border bg-white p-4 space-y-2">
      <div className="font-semibold">{title}</div>
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          const active = n <= (review.rating ?? 0);
          return (
            <Star
              key={n}
              className={active ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 text-muted-foreground"}
            />
          );
        })}
        <span className="ml-2 text-sm text-muted-foreground">{review.rating}/5</span>
      </div>
      {review.comment ? (
        <div className="text-sm whitespace-pre-wrap break-words">{review.comment}</div>
      ) : (
        <div className="text-sm text-muted-foreground">(无文字评价)</div>
      )}
    </div>
  );
}

export function JobReviews({
  jobId,
  jobStatus,
  currentUserId,
  creatorId,
  workerId,
  reviews,
}: {
  jobId: string;
  jobStatus: string | null;
  currentUserId: string | null;
  creatorId: string;
  workerId: string | null;
  reviews: ReviewRow[];
}) {
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isCompleted = jobStatus === "completed";

  const myReview = useMemo(() => {
    if (!currentUserId) return null;
    return reviews.find((r) => r.reviewer_id === currentUserId) ?? null;
  }, [currentUserId, reviews]);

  const canReview = useMemo(() => {
    if (!isCompleted) return false;
    if (!currentUserId) return false;
    const isCreator = currentUserId === creatorId;
    const isWorker = Boolean(workerId && currentUserId === workerId);
    return isCreator || isWorker;
  }, [currentUserId, creatorId, workerId, isCompleted]);

  const otherReviews = useMemo(() => {
    return reviews.filter((r) => r.reviewer_id !== currentUserId);
  }, [currentUserId, reviews]);

  if (!isCompleted) return null;

  return (
    <div className="rounded-2xl border bg-white p-6 space-y-6">
      <div>
        <div className="text-lg font-semibold">评价</div>
        <div className="text-sm text-muted-foreground">任务完成后，双方可互相评价（每人每单一次）</div>
      </div>

      {canReview ? (
        myReview ? (
          <div className="rounded-xl border bg-muted/10 p-4 space-y-2">
            <div className="font-semibold text-blue-600">你已评价</div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const n = i + 1;
                const active = n <= (myReview.rating ?? 0);
                return (
                  <Star
                    key={n}
                    className={active ? "h-4 w-4 fill-yellow-400 text-yellow-400" : "h-4 w-4 text-muted-foreground"}
                  />
                );
              })}
              <span className="ml-2 text-sm text-muted-foreground">{myReview.rating}/5</span>
            </div>
            <div className="text-sm whitespace-pre-wrap break-words">{myReview.comment ?? "(无文字评价)"}</div>
          </div>
        ) : (
          <div className="rounded-xl border p-4 space-y-3 shadow-sm bg-slate-50/50">
            <div className="font-semibold">提交评价</div>
            <StarsInput value={rating} onChange={setRating} disabled={isPending} />
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="写下你的评价（可选）"
              disabled={isPending}
              className="bg-white"
            />
            {error ? <div className="text-sm text-red-600">{error}</div> : null}
            <Button
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const res = await submitReview({ jobId, rating, comment });
                  if (!(res as any)?.success) {
                    setError((res as any)?.error ?? "提交失败");
                  }
                });
              }}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              提交评价
            </Button>
          </div>
        )
      ) : (
        <div className="text-sm text-muted-foreground italic">任务参与者在完成后即可进行评价。</div>
      )}

      {otherReviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {otherReviews.map((review) => {
            const isFromEmployer = review.reviewer_id === creatorId;
            const title = isFromEmployer ? "来自雇主的评价" : "来自开发者的评价";
            return <ReviewCard key={review.id} title={title} review={review} />;
          })}
        </div>
      )}
    </div>
  );
}
