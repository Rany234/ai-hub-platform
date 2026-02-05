"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, Hammer, PackageCheck, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BidDrawer } from "@/components/bids/BidDrawer";
import { DeliveryDrawer } from "@/components/delivery/DeliveryDrawer";
import { ReviewDrawer } from "@/components/delivery/ReviewDrawer";

export function BidButtonWithDrawer({
  jobId,
  jobStatus,
  isOwner,
  isWinner,
  userRole,
  deliveryUrl,
  deliveryNote,
  rejectionReason,
}: {
  jobId: string;
  jobStatus?: string | null;
  isOwner: boolean;
  isWinner: boolean;
  userRole: string | null;
  deliveryUrl?: string | null;
  deliveryNote?: string | null;
  rejectionReason?: string | null;
}) {
  const router = useRouter();

  // 1) Open job -> freelancer can bid; owner sees nothing (or management elsewhere)
  if (jobStatus === "open") {
    if (isOwner) {
      return null;
    }

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
        rejectionReason={rejectionReason ?? null}
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

  // 2b) Under review + winner -> show waiting state
  if (jobStatus === "under_review" && isWinner) {
    return (
      <Button size="lg" disabled className="w-full rounded-2xl bg-amber-500 text-white">
        <PackageCheck className="mr-2 h-5 w-5" />
        等待雇主审核
      </Button>
    );
  }

  // 3) Completed -> view delivery result (disabled)
  if (jobStatus === "completed") {
    const hasDelivery = Boolean(deliveryUrl || deliveryNote);

    return (
      <div className="space-y-3">
        <Button
          size="lg"
          disabled
          className="w-full rounded-2xl bg-slate-200 text-slate-700"
        >
          查看交付结果
        </Button>

        {hasDelivery ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-3">
            {deliveryUrl ? (
              <a
                href={deliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                交付链接
              </a>
            ) : null}

            {deliveryNote ? (
              <div className="text-sm text-slate-700 whitespace-pre-wrap break-words bg-slate-50 rounded-xl p-3">
                {deliveryNote}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  // 4) Under review + owner -> review drawer (red highlight)
  if (jobStatus === "under_review" && isOwner) {
    return (
      <ReviewDrawer
        jobId={jobId}
        deliveryUrl={deliveryUrl ?? null}
        deliveryNote={deliveryNote ?? null}
        onReviewed={() => router.refresh()}
        trigger={
          <Button
            size="lg"
            className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-[0_0_20px_rgba(239,68,68,0.25)] transition-all hover:scale-105"
          >
            <ShieldCheck className="mr-2 h-5 w-5" />
            审核交付成果
          </Button>
        }
      />
    );
  }

  // 4b) In progress + owner -> disabled waiting state (prevent accidental complete)
  if (jobStatus === "in_progress" && isOwner) {
    return (
      <Button size="lg" disabled className="w-full rounded-2xl bg-slate-300 text-slate-600">
        <ShieldCheck className="mr-2 h-5 w-5" />
        等待开发者交付...
      </Button>
    );
  }

  return null;
}
