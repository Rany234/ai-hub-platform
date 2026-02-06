"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { Plus, Check, X, FileText } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

import { getMessages, getUserConversations, sendMessage, sendOffer, handleOffer } from "@/app/actions/chat";

type ConversationListItem = {
  id: string;
  otherUser: {
    id?: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
  lastMessage?: {
    content?: string | null;
    created_at?: string | null;
  } | null;
};

type MessageRow = {
  id: string;
  sender_id: string;
  content: string;
  created_at?: string | null;
  conversation_id: string;
  type?: "text" | "offer";
  payload?: {
    amount: number;
    status: "pending" | "accepted" | "rejected";
    description?: string;
  } | null;
};

function OfferCard({ 
  msg, 
  isMe, 
  onAction 
}: { 
  msg: MessageRow; 
  isMe: boolean; 
  onAction: (id: string, action: "accept" | "decline") => void 
}) {
  const payload = msg.payload;
  if (!payload) return null;

  const isPending = payload.status === "pending";
  const statusLabels = {
    pending: "待处理",
    accepted: "已接受",
    rejected: "已拒绝"
  };

  return (
    <div className={`flex flex-col gap-3 min-w-[240px] p-4 rounded-xl border bg-white shadow-sm ${isMe ? "border-blue-200" : "border-slate-200"}`}>
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2 font-semibold text-slate-700">
          <FileText className="size-4 text-blue-500" />
          <span>聘书详情</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          payload.status === "accepted" ? "bg-green-100 text-green-700" :
          payload.status === "rejected" ? "bg-red-100 text-red-700" :
          "bg-blue-50 text-blue-700"
        }`}>
          {statusLabels[payload.status]}
        </span>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-blue-600">
          ¥{payload.amount.toLocaleString()}
        </div>
        {payload.description && (
          <div className="text-xs text-muted-foreground italic line-clamp-2">
            “{payload.description}”
          </div>
        )}
      </div>

      {!isMe && isPending && (
        <div className="flex gap-2 pt-1">
          <Button 
            size="sm" 
            className="flex-1 bg-green-600 hover:bg-green-700 h-8 gap-1"
            onClick={() => onAction(msg.id, "accept")}
          >
            <Check className="size-3" /> 接受
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 h-8 gap-1"
            onClick={() => onAction(msg.id, "decline")}
          >
            <X className="size-3" /> 拒绝
          </Button>
        </div>
      )}
    </div>
  );
}

function formatTime(ts?: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function ChatClient({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const [offerAmount, setOfferAmount] = useState("");
  const [offerNote, setOfferNote] = useState("");
  const [isOfferOpen, setIsOfferOpen] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowserClient();

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = (await getUserConversations()) as ConversationListItem[];
      if (cancelled) return;
      setConversations((data ?? []) as ConversationListItem[]);

      if (!activeId && data?.length) {
        setActiveId(data[0].id);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      if (!activeId) {
        setMessages([]);
        return;
      }
      const data = (await getMessages(activeId)) as MessageRow[];
      if (cancelled) return;
      setMessages((data ?? []) as MessageRow[]);
    }

    loadMessages();

    // Set up real-time subscription
    const channel = supabase
      .channel(`chat:${activeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${activeId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as MessageRow;
            setMessages((prev) => {
              // Prevent duplicate if user just sent it and it arrived via RPC then Realtime
              if (prev.some((m) => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
          } else if (payload.eventType === "UPDATE") {
            const updated = payload.new as MessageRow;
            setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          }
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [activeId, supabase]);

  const onSend = async () => {
    if (!activeId) return;
    if (!content.trim()) return;

    const text = content.trim();
    setContent(""); // Clear input immediately for better UX

    startTransition(async () => {
      const result = await sendMessage(activeId, text);
      if (result.success) {
        // Refresh messages list to get the official ID and timestamp if needed, 
        // though Realtime might have already handled it.
        const data = (await getMessages(activeId)) as MessageRow[];
        setMessages((data ?? []) as MessageRow[]);
        
        const list = (await getUserConversations()) as ConversationListItem[];
        setConversations((list ?? []) as ConversationListItem[]);
      }
    });
  };

  const onSendOffer = async () => {
    if (!activeId || !offerAmount) return;
    const amount = parseFloat(offerAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsOfferOpen(false);
    startTransition(async () => {
      const result = await sendOffer(activeId, amount, offerNote);
      if (result.success) {
        setOfferAmount("");
        setOfferNote("");
        const data = (await getMessages(activeId)) as MessageRow[];
        setMessages((data ?? []) as MessageRow[]);
      }
    });
  };

  const handleOfferAction = async (messageId: string, action: "accept" | "decline") => {
    if (!activeId) return;

    const newStatus = action === "accept" ? "accepted" : "rejected";

    // Optimistic update: update local UI immediately
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              payload: msg.payload ? { ...msg.payload, status: newStatus } : msg.payload,
            }
          : msg
      )
    );

    // Background sync
    startTransition(async () => {
      try {
        await handleOffer(messageId, action);

        // Fallback refresh (keeps UI consistent if realtime is delayed/missed)
        const data = (await getMessages(activeId)) as MessageRow[];
        setMessages((data ?? []) as MessageRow[]);

        const list = (await getUserConversations()) as ConversationListItem[];
        setConversations((list ?? []) as ConversationListItem[]);
      } catch (error) {
        console.error("Offer update failed:", error);
      }
    });
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] min-h-[600px] rounded-2xl border bg-background overflow-hidden">
      {/* Left: conversation list */}
      <div className="w-full max-w-sm border-r bg-muted/10">
        <div className="px-4 py-3 font-semibold text-lg border-b bg-background/50">消息中心</div>
        <ScrollArea className="h-[calc(100%-3.5rem)]">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-6 text-sm text-muted-foreground text-center">暂无会话</div>
            ) : (
              conversations.map((c) => {
                const isActive = c.id === activeId;
                const name = c.otherUser?.full_name ?? "未知用户";
                const preview = c.lastMessage?.content ?? "";
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all " +
                      (isActive ? "bg-background shadow-md ring-1 ring-border" : "hover:bg-background/60")
                    }
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={c.otherUser?.avatar_url ?? ""} />
                      <AvatarFallback className="bg-blue-100 text-blue-700">{name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-sm truncate">{name}</div>
                      <div className="text-xs text-muted-foreground truncate">{preview}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground shrink-0">
                      {formatTime(c.lastMessage?.created_at)}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right: message area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        <div className="h-14 border-b flex items-center px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {activeConversation && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={activeConversation.otherUser?.avatar_url ?? ""} />
                <AvatarFallback>{activeConversation.otherUser?.full_name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
            )}
            <div className="font-semibold text-sm">
              {activeConversation?.otherUser?.full_name ?? "选择一个会话"}
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="p-4 space-y-4">
            {!activeId ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                请先选择一个会话开始交流
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
                还没有消息，开始第一句问候吧
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId;
                const isOffer = msg.type === "offer";

                return (
                  <div key={msg.id} className={"flex " + (isMe ? "justify-end" : "justify-start")}>
                    {isOffer ? (
                      <OfferCard msg={msg} isMe={isMe} onAction={handleOfferAction} />
                    ) : (
                      <div
                        className={
                          "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm " +
                          (isMe
                            ? "bg-blue-600 text-white rounded-br-none"
                            : "bg-white border border-slate-100 text-slate-800 rounded-bl-none")
                        }
                      >
                        <div className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</div>
                        <div
                          className={
                            "mt-1 text-[10px] " +
                            (isMe ? "text-blue-100" : "text-muted-foreground")
                          }
                        >
                          {formatTime(msg.created_at)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-4 bg-background">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <Popover open={isOfferOpen} onOpenChange={setIsOfferOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 border-slate-200">
                  <Plus className="h-5 w-5 text-slate-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start" side="top">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold leading-none">发起聘书</h4>
                    <p className="text-sm text-muted-foreground">向开发者发送工作邀约</p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="amount" className="text-xs">金额 (CNY)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.00"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="note" className="text-xs">备注 / 工作说明</Label>
                      <Input
                        id="note"
                        placeholder="例如：Logo 设计项目"
                        value={offerNote}
                        onChange={(e) => setOfferNote(e.target.value)}
                      />
                    </div>
                    <Button 
                      className="w-full bg-blue-600 hover:bg-blue-700 mt-2"
                      onClick={onSendOffer}
                      disabled={!offerAmount || parseFloat(offerAmount) <= 0}
                    >
                      确认发送
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Input
              placeholder="输入消息..."
              className="bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-blue-500 h-10"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              disabled={!activeId || isPending}
            />
            <Button 
              onClick={onSend} 
              disabled={!activeId || isPending || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 px-6 h-10"
            >
              发送
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
