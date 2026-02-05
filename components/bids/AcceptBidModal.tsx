"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { acceptBid } from "@/app/actions/job";

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

export function AcceptBidModal({
  developerName,
  amountLabel,
  onAccepted,
  trigger,
  bidId,
}: {
  bidId: string;
  developerName: string;
  amountLabel: string;
  trigger: React.ReactNode;
  onAccepted?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);

    try {
      const res = await acceptBid(bidId);

      if (!res.success) {
        toast.error(res.error || "聘用失败，请重试");
        return;
      }

      toast.success("聘用成功！任务已进入开发阶段。");
      setOpen(false);
      onAccepted?.();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

      const message = error instanceof Error ? error.message : "聘用失败";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认聘用该开发者？</AlertDialogTitle>
          <AlertDialogDescription>
            采纳后任务将进入“进行中”阶段，系统将通知该开发者开始工作。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="rounded-xl border border-slate-100 bg-white p-4 text-sm">
          <div className="text-slate-700">
            开发者：<span className="font-medium text-slate-900">{developerName}</span>
          </div>
          <div className="mt-2 text-slate-700">
            最终报价：<span className="font-mono text-base text-blue-600">{amountLabel}</span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>取消</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              if (!loading) void handleAccept();
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                确认聘用
              </span>
            ) : (
              "确认聘用"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
