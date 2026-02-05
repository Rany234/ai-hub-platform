"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Loader2, ShieldCheck, XCircle } from "lucide-react";

import { approveDelivery, rejectDelivery } from "@/app/actions/job";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReviewDrawer({
  jobId,
  trigger,
  deliveryUrl,
  deliveryNote,
  onReviewed,
}: {
  jobId: string;
  trigger: React.ReactNode;
  deliveryUrl?: string | null;
  deliveryNote?: string | null;
  onReviewed?: () => void;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"idle" | "reject">("idle");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasDelivery = Boolean(deliveryUrl?.trim() || deliveryNote?.trim());
  const titleSuffix = useMemo(() => (hasDelivery ? "" : "（暂无交付）"), [hasDelivery]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    const loadingId = toast.loading("正在验收...", { duration: Infinity });

    try {
      const res = await approveDelivery(jobId);
      if (!res.success) {
        toast.error(res.error || "验收失败，请重试", { id: loadingId, duration: 6000 });
        return;
      }

      toast.success("验收通过，任务已完成！", { id: loadingId, duration: 4000 });
      await new Promise((r) => setTimeout(r, 400));

      setOpen(false);
      onReviewed?.();
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
      const message = error instanceof Error ? error.message : "验收失败";
      toast.error(message, { id: loadingId });
    } finally {
      toast.dismiss();
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error("请填写驳回原因");
      return;
    }

    setIsSubmitting(true);
    const loadingId = toast.loading("正在提交驳回意见...", { duration: Infinity });

    try {
      const res = await rejectDelivery({ jobId, reason: reason.trim() });
      if (!res.success) {
        toast.error(res.error || "驳回失败，请重试", { id: loadingId, duration: 6000 });
        return;
      }

      toast.success("已驳回，等待开发者重新提交交付。", { id: loadingId, duration: 4000 });
      await new Promise((r) => setTimeout(r, 400));

      setOpen(false);
      setMode("idle");
      setReason("");
      onReviewed?.();
      router.refresh();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;
      const message = error instanceof Error ? error.message : "驳回失败";
      toast.error(message, { id: loadingId });
    } finally {
      toast.dismiss();
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">审核交付成果{titleSuffix}</SheetTitle>
          <SheetDescription>查看开发者提交的交付内容，并选择通过或驳回。</SheetDescription>
        </SheetHeader>

        <div className="px-4 pb-4 space-y-5">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-900">成果链接</div>
            {deliveryUrl?.trim() ? (
              <a
                href={deliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline break-all"
              >
                <ExternalLink className="h-4 w-4" />
                {deliveryUrl}
              </a>
            ) : (
              <div className="text-sm text-muted-foreground">未提供</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-900">交付说明</div>
            <div className="text-sm text-slate-700 whitespace-pre-wrap break-words bg-slate-50 rounded-xl p-3 border border-slate-100">
              {deliveryNote?.trim() ? deliveryNote : "未提供"}
            </div>
          </div>

          {mode === "reject" ? (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">驳回原因</Label>
              <Textarea
                id="rejectionReason"
                rows={6}
                disabled={isSubmitting}
                placeholder="请说明需要修改/补充的内容、验收不通过的原因、期望的交付标准等..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">该原因将写回任务，并展示给开发者。</div>
            </div>
          ) : null}

          <SheetFooter className="px-0 gap-2">
            {mode === "reject" ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl"
                  onClick={() => {
                    setMode("idle");
                    setReason("");
                  }}
                >
                  取消
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => void handleReject()}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      提交中...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      确认驳回
                    </span>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => setMode("reject")}
                >
                  <XCircle className="mr-2 h-5 w-5" />
                  驳回 (Request Changes)
                </Button>

                <Button
                  type="button"
                  disabled={isSubmitting}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
                  onClick={() => void handleApprove()}
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      处理中...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5" />
                      验收通过 (Approve)
                    </span>
                  )}
                </Button>
              </>
            )}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
