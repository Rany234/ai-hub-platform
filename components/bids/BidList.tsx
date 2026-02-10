"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Star, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AcceptBidModal } from "@/components/bids/AcceptBidModal";
import { startChat } from "@/app/actions/chat";
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

function ContactDeveloperDialog({
  developerName,
  email,
  wechatId,
}: {
  developerName: string;
  email?: string | null;
  wechatId?: string | null;
}) {
  const [open, setOpen] = useState(false);

  const normalizedEmail = email?.trim() ? email.trim() : null;
  const normalizedWechatId = wechatId?.trim() ? wechatId.trim() : null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // toast.success("已复制到剪贴板");
    } catch {
      // fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand("copy");
        // toast.success("已复制到剪贴板");
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="rounded-xl">
          💬 联系 TA
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#151F32] border-[#334155] text-slate-100 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>联系开发者</AlertDialogTitle>
          <AlertDialogDescription>
            以下是该开发者的联系方式，点击即可复制。
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#334155] bg-[#151F32] p-4">
            <div className="text-sm font-medium text-slate-200 mb-2">邮箱</div>
            <div className="flex items-center justify-between gap-2">
              {normalizedEmail ? (
                <>
                  <span className="font-mono text-sm text-brand-action">{normalizedEmail}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void copyToClipboard(normalizedEmail)}
                    className="shrink-0"
                  >
                    复制
                  </Button>
                </>
              ) : (
                <span className="text-sm text-slate-500">该用户未公开联系方式</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#334155] bg-[#151F32] p-4">
            <div className="text-sm font-medium text-slate-200 mb-2">微信</div>
            <div className="flex items-center justify-between gap-2">
              {normalizedWechatId ? (
                <>
                  <span className="font-mono text-sm text-emerald-400">{normalizedWechatId}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void copyToClipboard(normalizedWechatId)}
                    className="shrink-0"
                  >
                    复制
                  </Button>
                </>
              ) : (
                <span className="text-sm text-slate-500">该用户未公开联系方式</span>
              )}
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction>关闭</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function formatDeliveryTime(value?: string | null) {
  if (!value) return "-";
  if (value === "3d") return "3 天";
  if (value === "7d") return "1 周";
  if (value === "14d") return "2 周";
  if (value === "30d") return "1 个月";
  if (value === "custom") return "可协商";
  return value;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

type BidWithProfile = {
  id: string;
  amount: number | string | null;
  delivery_time: string | null;
  proposal: string | null;
  created_at: string | null;
  bidder_id: string | null;
  status?: string | null;
  avg_rating?: number | null;
  review_count?: number | null;
  profiles?:
    | {
        id: any;
        full_name: any;
        avatar_url: any;
        role: any;
        email?: any;
        wechat_id?: any;
      }
    | Array<{
        id: any;
        full_name: any;
        avatar_url: any;
        role: any;
        email?: any;
        wechat_id?: any;
      }>;
};

export function BidList({
  bids,
  isEmployer,
  jobStatus,
  selectedBidId,
}: {
  bids: BidWithProfile[];
  isEmployer: boolean;
  jobStatus?: string | null;
  selectedBidId?: string | null;
}) {
  const router = useRouter();

  if (!isEmployer) {
    return (
      <div className="rounded-2xl border border-[#334155] bg-[#151F32] p-6 text-sm text-slate-400">
        已收到投标：{bids?.length ?? 0}
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <div className="rounded-2xl border border-[#334155] bg-[#151F32] p-6 text-sm text-slate-400">
        暂无投标
      </div>
    );
  }

  const isJobOpen = jobStatus === "open";
  const hasSelectedBid = Boolean(selectedBidId);

  const hiredBidId = selectedBidId ?? null;

  return (
    <div>
      {bids.map((bid) => {
        const profileRaw = bid?.profiles;
        const profile = Array.isArray(profileRaw) ? profileRaw?.[0] : profileRaw;

        const amountNum = bid?.amount !== null && bid?.amount !== undefined ? Number(bid.amount) : NaN;
        const amountLabel = Number.isFinite(amountNum) ? `￥${amountNum}` : "-";

        const isHired = Boolean(hiredBidId && bid?.id === hiredBidId);
        const isNotSelected = Boolean(hasSelectedBid && !isHired);
        const isDimmed = isNotSelected;

        const developerName = profile?.full_name ?? "匿名用户";

        return (
          <div
            key={bid.id}
            className={`bg-[#151F32] border border-[#334155] rounded-2xl p-6 mb-4 shadow-2xl ${isDimmed ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url ?? ""} />
                  <AvatarFallback>{developerName?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="font-medium truncate">{developerName}</div>
                    {bid?.avg_rating !== null && bid?.avg_rating !== undefined ? (
                      <div className="inline-flex items-center gap-1 text-xs text-slate-300">
                        <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        <span>{Number(bid.avg_rating).toFixed(1)}</span>
                        {bid?.review_count ? (
                          <span className="text-slate-500">({bid.review_count})</span>
                        ) : null}
                      </div>
                    ) : null}
                    {isHired ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">🏆 已中标 (Hired)</Badge>
                    ) : isNotSelected ? (
                      <Badge variant="secondary">未选中</Badge>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500">{formatDateTime(bid.created_at)}</div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-xl text-brand-action">{amountLabel}</div>
                <div className="text-xs text-slate-500">交付周期：{formatDeliveryTime(bid.delivery_time)}</div>
              </div>
            </div>

            {bid?.proposal ? (
              <div className="mt-4 text-sm text-slate-200 whitespace-pre-wrap break-words">
                {bid.proposal}
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-500">（未填写方案）</div>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={() => startChat(String(bid.bidder_id))}
                disabled={!bid.bidder_id}
              >
                <MessageCircle className="h-4 w-4" />
                💬 联系
              </Button>

              {isJobOpen ? (
                <AcceptBidModal
                  bidId={bid.id}
                  developerName={developerName}
                  amountLabel={amountLabel}
                  onAccepted={() => router.refresh()}
                  trigger={
                    <Button className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">采纳</Button>
                  }
                />
              ) : isHired ? (
                <ContactDeveloperDialog
                  developerName={developerName}
                  email={(profile as any)?.email ?? null}
                  wechatId={(profile as any)?.wechat_id ?? null}
                />
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
