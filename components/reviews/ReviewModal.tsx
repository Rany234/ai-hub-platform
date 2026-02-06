"use client";

import { useMemo, useState } from "react";

import { toast } from "sonner";

import { submitReview } from "@/app/actions/review";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function StarButton({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-2xl leading-none ${filled ? "text-yellow-500" : "text-slate-300"}`}
      aria-label={filled ? "star filled" : "star"}
    >
      ★
    </button>
  );
}

export function ReviewModal({
  jobId,
  revieweeId,
  trigger,
}: {
  jobId: string;
  revieweeId: string;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);

  async function onSubmit() {
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("job_id", jobId);
      formData.set("reviewee_id", revieweeId);
      formData.set("rating", String(rating));
      formData.set("comment", comment);

      const res = await submitReview(formData);
      if (!res?.success) {
        throw new Error(res?.error ?? "提交失败");
      }

      toast.success("评价已提交");
      setOpen(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>评价本次合作</AlertDialogTitle>
          <AlertDialogDescription>请为开发者打分并留下简短评语。</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div>
            <div className="mb-2 text-sm font-medium text-slate-700">评分</div>
            <div className="flex items-center gap-1">
              {stars.map((s) => (
                <StarButton key={s} filled={s <= rating} onClick={() => setRating(s)} />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">{rating}.0</span>
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium text-slate-700">评语</div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="可以写写合作体验、交付质量等（可选）"
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>取消</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={() => void onSubmit()} disabled={submitting}>
              {submitting ? "提交中..." : "提交评价"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
