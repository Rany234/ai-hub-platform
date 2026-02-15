"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { remixListing } from "@/features/listings/actions";

type Props = {
  originalListingId: string;
  currentUserId: string;
};

export function RemixButton({ originalListingId, currentUserId }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (pending) return;
    setPending(true);

    try {
      toast.loading("正在创建 Remix...", { id: "remix" });
      const res = await remixListing(originalListingId, currentUserId);
      if (!res.success) {
        toast.error(res.error || "Remix 失败", { id: "remix" });
        return;
      }

      toast.success("Remix 创建成功，正在跳转...", { id: "remix" });
      router.push(`/dashboard/listings/${encodeURIComponent(res.data.id)}/edit`);
    } catch (e) {
      toast.error("Remix 失败，请稍后重试", { id: "remix" });
    } finally {
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="gap-2 border-white/10 text-slate-200 hover:bg-white/5"
      onClick={onClick}
      disabled={pending}
    >
      {pending ? "创建中..." : "派生 / Remix"}
    </Button>
  );
}
