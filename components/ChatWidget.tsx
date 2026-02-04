"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
};

type ConversationRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  order_id: string | null;
  created_at: string;
  updated_at: string;
};

type MessageRow = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  is_read: boolean;
};

type Props = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialConversationId?: string;
};

function displayName(p: Profile | null) {
  return p?.full_name || p?.username || "用户";
}

function otherParticipant(convo: ConversationRow, meId: string) {
  return convo.buyer_id === meId ? convo.seller_id : convo.buyer_id;
}

export function ChatWidget({ open: openProp, onOpenChange, initialConversationId }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [me, setMe] = useState<Profile | null>(null);
  const [open, setOpen] = useState<boolean>(openProp ?? false);

  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [profilesById, setProfilesById] = useState<Record<string, Profile>>({});

  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    initialConversationId ?? null
  );
  const [messages, setMessages] = useState<MessageRow[]>([]);

  const [loadingConversations, setLoadingConversations] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const setOpenState = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange, openProp]
  );

  useEffect(() => {
    if (openProp !== undefined) setOpen(openProp);
  }, [openProp]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        if (mounted) setMe(null);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (mounted) setMe((profile as Profile) ?? null);
    })();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const loadConversations = useCallback(async () => {
    if (!me?.id) return;

    setLoadingConversations(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("id, buyer_id, seller_id, order_id, created_at, updated_at")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      const rows = (data ?? []) as ConversationRow[];
      setConversations(rows);

      const otherIds = Array.from(new Set(rows.map((c) => otherParticipant(c, me.id))));
      if (otherIds.length) {
        const { data: profs, error: pErr } = await supabase
          .from("profiles")
          .select("id, username, full_name, avatar_url")
          .in("id", otherIds);
        if (pErr) throw pErr;

        const map: Record<string, Profile> = {};
        for (const p of (profs ?? []) as Profile[]) map[p.id] = p;
        setProfilesById((prev) => ({ ...prev, ...map }));
      }
    } finally {
      setLoadingConversations(false);
    }
  }, [me?.id, supabase]);

  const loadMessages = useCallback(async () => {
    if (!activeConversationId) return;
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, conversation_id, sender_id, content, image_url, created_at, is_read")
        .eq("conversation_id", activeConversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages((data ?? []) as MessageRow[]);
    } finally {
      setLoadingMessages(false);
    }
  }, [activeConversationId, supabase]);

  useEffect(() => {
    if (!me?.id) return;
    loadConversations();
  }, [loadConversations, me?.id]);

  useEffect(() => {
    if (!activeConversationId) return;
    loadMessages();
  }, [activeConversationId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, open, activeConversationId]);

  useEffect(() => {
    if (!me?.id) return;

    const channel = supabase
      .channel(`chat-${me.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as MessageRow;

          setConversations((prev) => {
            const idx = prev.findIndex((c) => c.id === m.conversation_id);
            if (idx === -1) return prev;
            const copy = [...prev];
            const [found] = copy.splice(idx, 1);
            copy.unshift(found);
            return copy;
          });

          if (m.conversation_id === activeConversationId) {
            setMessages((prev) => {
              if (prev.some((x) => x.id === m.id)) return prev;
              return [...prev, m];
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, me?.id, supabase]);

  const sendText = useCallback(async () => {
    if (!me?.id || !activeConversationId) return;

    const text = draft.trim();
    if (!text) return;

    setSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: activeConversationId,
        sender_id: me.id,
        content: text,
      });
      if (error) throw error;
      setDraft("");
    } finally {
      setSending(false);
    }
  }, [activeConversationId, draft, me?.id, supabase]);

  const pickImage = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const onImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !me?.id || !activeConversationId) return;

      if (!file.type.startsWith("image/")) return;

      setUploadingImage(true);
      try {
        const ext = file.name.split(".").pop() || "png";
        const path = `${activeConversationId}/${me.id}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(path, file, { upsert: true, contentType: file.type });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("listings").getPublicUrl(path);
        const publicUrl = data.publicUrl;
        if (!publicUrl) throw new Error("无法获取图片公开地址");

        const { error } = await supabase.from("messages").insert({
          conversation_id: activeConversationId,
          sender_id: me.id,
          image_url: publicUrl,
        });
        if (error) throw error;

        if (fileInputRef.current) fileInputRef.current.value = "";
      } finally {
        setUploadingImage(false);
      }
    },
    [activeConversationId, me?.id, supabase]
  );

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const activeOtherId = me?.id && activeConversation ? otherParticipant(activeConversation, me.id) : null;
  const activeOtherProfile = activeOtherId ? profilesById[activeOtherId] ?? null : null;

  if (!me) return null;

  return (
    <>
      <div className="fixed bottom-5 right-5 z-50">
        <button
          type="button"
          onClick={() => setOpenState(!open)}
          className="rounded-full bg-black text-white px-4 py-3 shadow"
        >
          {open ? "关闭消息" : "消息"}
        </button>
      </div>

      {open ? (
        <div className="fixed bottom-20 right-5 z-50 w-[92vw] max-w-4xl h-[70vh] bg-white border shadow-lg rounded-lg overflow-hidden">
          <div className="h-full grid grid-cols-1 md:grid-cols-[320px_1fr]">
            <div className="border-r h-full overflow-y-auto">
              <div className="px-4 py-3 font-medium border-b">对话</div>
              {loadingConversations ? (
                <div className="p-4 text-sm text-muted-foreground">加载中...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">暂无对话</div>
              ) : (
                <div className="divide-y">
                  {conversations.map((c) => {
                    const otherId = otherParticipant(c, me.id);
                    const p = profilesById[otherId] ?? null;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveConversationId(c.id)}
                        className={`w-full text-left px-4 py-3 hover:bg-muted/40 ${
                          c.id === activeConversationId ? "bg-muted/40" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full overflow-hidden bg-muted flex items-center justify-center text-xs">
                            {p?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={p.avatar_url} alt="avatar" className="h-full w-full object-cover" />
                            ) : (
                              "头像"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate">{displayName(p)}</div>
                            <div className="text-xs text-muted-foreground truncate">最近更新</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="text-sm font-medium truncate">
                  {activeOtherProfile ? displayName(activeOtherProfile) : "选择一个对话"}
                </div>
                <button
                  type="button"
                  className="text-xs underline text-muted-foreground"
                  onClick={() => setOpenState(false)}
                >
                  收起
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {!activeConversationId ? (
                  <div className="text-sm text-muted-foreground">从左侧选择一个对话开始聊天</div>
                ) : loadingMessages ? (
                  <div className="text-sm text-muted-foreground">加载消息中...</div>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender_id === me.id;
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 text-sm border ${
                            mine ? "bg-black text-white" : "bg-white"
                          }`}
                        >
                          {m.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.image_url} alt="image" className="max-h-64 rounded" />
                          ) : null}
                          {m.content ? <div className={m.image_url ? "mt-2" : ""}>{m.content}</div> : null}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t p-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={pickImage}
                    className="rounded-md border px-3 py-2 text-sm"
                    disabled={!activeConversationId || uploadingImage}
                  >
                    {uploadingImage ? "上传中..." : "发图"}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onImageChange}
                  />

                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={activeConversationId ? "输入消息..." : "先选择对话"}
                    className="flex-1 rounded-md border px-3 py-2 text-sm"
                    disabled={!activeConversationId}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void sendText();
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void sendText()}
                    className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
                    disabled={!activeConversationId || sending}
                  >
                    发送
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
