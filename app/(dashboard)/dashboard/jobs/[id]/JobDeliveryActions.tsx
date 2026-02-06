"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { approveWork, rejectWork, submitWork } from "@/app/actions/job";

export function JobDeliveryActions({
  jobId,
  status,
  isOwner,
  isWorker,
  deliverables,
}: {
  jobId: string;
  status: string | null;
  isOwner: boolean;
  isWorker: boolean;
  deliverables: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(deliverables ?? "");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitWork(jobId, content);
        if ((result as any)?.success) {
          setOpen(false);
        } else {
          setError((result as any)?.error ?? "提交失败");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "提交失败");
      }
    });
  };

  const onApprove = () => {
    setError(null);
    startTransition(async () => {
      try {
        await approveWork(jobId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "验收失败");
      }
    });
  };

  const onReject = () => {
    setError(null);
    startTransition(async () => {
      try {
        await rejectWork(jobId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "驳回失败");
      }
    });
  };

  // Case A: in_progress + worker
  if (status === "in_progress" && isWorker) {
    return (
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="font-semibold">交付与验收</div>
        <div className="text-sm text-muted-foreground">
          任务进行中。完成后请提交交付链接/备注，进入雇主验收。
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
              📤 提交成果
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>提交成果</DialogTitle>
              <DialogDescription>填写交付链接、仓库地址或备注说明。</DialogDescription>
            </DialogHeader>

            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="例如：https://github.com/... 或者线上链接 + 说明"
              className="min-h-[120px]"
              disabled={isPending}
            />

            {error ? <div className="text-sm text-red-600">{error}</div> : null}

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
                取消
              </Button>
              <Button onClick={onSubmit} disabled={isPending || !content.trim()}>
                确认提交
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Case B: in_review + employer
  if (status === "in_review" && isOwner) {
    return (
      <div className="rounded-2xl border bg-white p-4 space-y-3">
        <div className="font-semibold">验收成果</div>
        <div className="text-sm text-muted-foreground">
          开发者已提交成果：
        </div>
        <div className="rounded-lg border bg-muted/20 p-3 text-sm whitespace-pre-wrap break-words">
          {deliverables?.trim() ? deliverables : "(未填写)"}
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        <div className="flex gap-2">
          <Button
            onClick={onApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            ✅ 验收通过
          </Button>
          <Button
            onClick={onReject}
            disabled={isPending}
            variant="outline"
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            ❌ 驳回
          </Button>
        </div>
      </div>
    );
  }

  // Case C: completed
  if (status === "completed") {
    return (
      <div className="rounded-2xl border bg-green-50 p-4 text-green-800 font-semibold">
        ✅ 任务已完成
      </div>
    );
  }

  return null;
}
