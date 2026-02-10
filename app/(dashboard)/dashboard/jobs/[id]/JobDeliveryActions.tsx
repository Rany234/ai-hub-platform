"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

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
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 space-y-3 shadow-xl">
        <div className="font-semibold text-white">交付与验收</div>
        <div className="text-sm text-slate-400">
          任务进行中。完成后请提交交付成果，进入雇主验收。
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button disabled={isPending} className="bg-brand-action hover:bg-amber-600 text-white font-bold w-full shadow-lg shadow-amber-900/20 transition-all">
              📤 提交成果
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-brand-surface border-brand-border text-slate-100 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">提交成果</DialogTitle>
              <DialogDescription className="text-slate-400">填写交付链接、仓库地址或备注说明。</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="rounded-xl border-2 border-dashed border-slate-600 bg-transparent p-8 flex flex-col items-center justify-center text-center hover:border-brand-action/50 hover:bg-white/5 transition-all cursor-pointer">
                <div className="text-slate-400 text-sm">点击或拖拽文件到此处上传附件</div>
                <div className="text-slate-500 text-xs mt-1">支持 ZIP, PDF, 图像等 (最大 50MB)</div>
              </div>

              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="例如：交付物链接、代码仓库或具体的交付说明..."
                className="min-h-[120px] bg-black/20 border-brand-border text-slate-200 placeholder:text-slate-600 focus:ring-brand-action/20 focus:border-brand-action/50"
                disabled={isPending}
              />
            </div>

            {error ? <div className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded-lg">{error}</div> : null}

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending} className="border-brand-border text-slate-300 hover:bg-white/5">
                取消
              </Button>
              <Button onClick={onSubmit} disabled={isPending || !content.trim()} className="bg-brand-action hover:bg-amber-600 text-white font-bold">
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
      <div className="rounded-2xl border border-brand-border bg-brand-surface p-4 space-y-3 shadow-xl">
        <div className="font-semibold text-white">验收成果</div>
        <div className="text-sm text-slate-400">
          开发者已提交成果：
        </div>
        <div className="rounded-lg border border-brand-border bg-black/20 p-3 text-sm text-slate-200 whitespace-pre-wrap break-words">
          {deliverables?.trim() ? deliverables : "(未填写)"}
        </div>

        {error ? <div className="text-sm text-red-400 bg-red-900/20 border border-red-900/50 p-3 rounded-lg">{error}</div> : null}

        <div className="flex gap-2">
          <Button
            onClick={onApprove}
            disabled={isPending}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-900/20"
          >
            ✅ 验收通过
          </Button>
          <Button
            onClick={onReject}
            disabled={isPending}
            variant="outline"
            className="flex-1 border-red-900/50 text-red-400 bg-red-900/10 hover:bg-red-900/20 transition-colors"
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
      <div className="rounded-2xl border border-emerald-900/30 bg-emerald-500/10 p-4 text-emerald-400 font-bold flex items-center gap-2 shadow-inner">
        <Check className="size-5" />
        任务已完成，资金已释放
      </div>
    );
  }

  return null;
}
