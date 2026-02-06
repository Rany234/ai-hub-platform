"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  getMessages,
  getUserConversations,
  sendMessage,
} from "@/app/actions/chat";

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
};

function formatTime(ts?: string | null) {
  if (!ts) return "";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function ChatClient() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get("id");

  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const data = (await getUserConversations()) as any[];
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
      const data = (await getMessages(activeId)) as any[];
      if (cancelled) return;
      setMessages((data ?? []) as MessageRow[]);
    }

    loadMessages();

    return () => {
      cancelled = true;
    };
  }, [activeId]);

  const onSend = async () => {
    if (!activeId) return;
    if (!content.trim()) return;

    const text = content.trim();
    setContent("");

    startTransition(async () => {
      await sendMessage(activeId, text);
      const data = (await getMessages(activeId)) as any[];
      setMessages((data ?? []) as MessageRow[]);
      const list = (await getUserConversations()) as any[];
      setConversations((list ?? []) as ConversationListItem[]);
    });
  };

  return (
    <div className="flex h-[calc(100svh-4rem)] min-h-[600px] rounded-2xl border bg-background overflow-hidden">
      {/* Left: conversation list */}
      <div className="w-full max-w-sm border-r bg-muted/10">
        <div className="px-4 py-3 font-semibold">消息</div>
        <ScrollArea className="h-[calc(100%-3rem)]">
          <div className="p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="px-3 py-6 text-sm text-muted-foreground">暂无会话</div>
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
                      "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors " +
                      (isActive ? "bg-background shadow-sm" : "hover:bg-background/60")
                    }
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.otherUser?.avatar_url ?? ""} />
                      <AvatarFallback>{name?.[0] ?? "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{name}</div>
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
      <div className="flex-1 flex flex-col">
        <div className="h-14 border-b flex items-center px-4">
          <div className="font-semibold">
            {activeConversation?.otherUser?.full_name ?? "选择一个会话"}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {!activeId ? (
              <div className="text-sm text-muted-foreground">请先选择一个会话</div>
            ) : messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">还没有消息，发一条试试</div>
            ) : (
              messages.map((m) => {
                const isMine = false; // Client doesn't know current user id without extra fetch; keep MVP neutral
                return (
                  <div
                    key={m.id}
                    className={
                      "flex " + (isMine ? "justify-end" : "justify-start")
                    }
                  >
                    <div
                      className={
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm " +
                        (isMine
                          ? "bg-blue-600 text-white"
                          : "bg-muted text-foreground")
                      }
                    >
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                      <div
                        className={
                          "mt-1 text-[10px] opacity-70 " +
                          (isMine ? "text-white" : "text-muted-foreground")
                        }
                      >
                        {formatTime(m.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-3 flex items-center gap-2">
          <Input
            placeholder="输入消息..."
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
          <Button onClick={onSend} disabled={!activeId || isPending || !content.trim()}>
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
