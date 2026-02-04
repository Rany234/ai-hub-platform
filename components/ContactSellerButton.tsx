"use client";

import { useState } from "react";

import { toastError } from "@/lib/toast";
import { ChatWidget } from "./ChatWidget";

type Props = {
  sellerId: string;
  listingId?: string;
  orderId?: string | null;
};

export function ContactSellerButton({ sellerId, listingId, orderId }: Props) {
  const [chatOpen, setChatOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId, orderId }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as null | { error?: string };
        toastError(payload?.error || "创建对话失败");
        return;
      }

      const { conversationId: cid } = (await res.json()) as { conversationId: string };
      setConversationId(cid);
      setChatOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
      >
        {loading ? "创建对话中..." : "联系卖家"}
      </button>

      {conversationId ? (
        <ChatWidget
          open={chatOpen}
          onOpenChange={setChatOpen}
          initialConversationId={conversationId}
        />
      ) : null}
    </>
  );
}