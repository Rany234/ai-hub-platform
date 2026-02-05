"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Hammer, PackageCheck, ShieldCheck } from "lucide-react";

import { completeJob } from "@/app/actions/job";

import { Button } from "@/components/ui/button";
import { BidDrawer } from "@/components/bids/BidDrawer";
import { DeliveryDrawer } from "@/components/delivery/DeliveryDrawer";

export function BidButtonWithDrawer({
  jobId,
  jobStatus,
  isOwner,
  isWinner,
  userRole,
  deliveryUrl,
  deliveryNote,
}: {
  jobId: string;
  jobStatus?: string | null;
  isOwner: boolean;
  isWinner: boolean;
  userRole: string | null;
  deliveryUrl?: string | null;
  deliveryNote?: string | null;
}) {
  const router = useRouter();

  // 1) Open job -> keep original bid flow (freelancer only)
  if (jobStatus === "open") {
    if (userRole !== "freelancer") {
      return null;
    }

    return (
      <BidDrawer
        jobId={jobId}
        trigger={
          <Button
            size="lg"
            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-900 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] shadow-blue-500/50 transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
          >
            <Hammer className="mr-2 h-5 w-5" />
            立即投标
          </Button>
        }
      />
    );
  }

  // 2) In progress + winner -> delivery submission
  if (jobStatus === "in_progress" && isWinner) {
    return (
      <DeliveryDrawer
        jobId={jobId}
        defaultUrl={deliveryUrl ?? null}
        defaultNote={deliveryNote ?? null}
        onSubmitted={() => router.refresh()}
        trigger={
          <Button
            size="lg"
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.25)] transition-all hover:scale-105"
          >
            <PackageCheck className="mr-2 h-5 w-5" />
            提交交付成果
          </Button>
        }
      />
    );
  }

  // 3) In progress + owner -> acceptance
  if (jobStatus === "in_progress" && isOwner) {
    const handleComplete = async () => {
      const loadingId = toast.loading("正在验收并完成任务...");
      try {
        const res = await completeJob(jobId);
        if (!res.success) {
          toast.error(res.error || "验收失败，请重试", { id: loadingId, duration: 6000 });
          return;
        }

        toast.success("任务圆满完成！", {
          id: loadingId,
          duration: 5000,
        });

        router.refresh();
      } catch (error: unknown) {
        if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

        const message = error instanceof Error ? error.message : "验收失败";
        toast.error(message, { id: loadingId });
      } finally {
        toast.dismiss();
      }
    };

    return (
      <Button
        size="lg"
        onClick={() => void handleComplete()}
        className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all hover:scale-105"
      >
        <ShieldCheck className="mr-2 h-5 w-5" />
        验收成果
      </Button>
    );
  }

  return null;
}
