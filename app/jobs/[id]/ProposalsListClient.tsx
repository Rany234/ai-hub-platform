"use client";

import { useEffect, useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast";

type Props = {
  jobId: string;
};

type ProposalRow = {
  id: string;
  job_id: string;
  freelancer_id: string;
  price: number;
  days: number;
  cover_letter: string | null;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  profiles?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export function ProposalsListClient({ jobId }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [items, setItems] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [hiringId, setHiringId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("proposals")
          .select(
            "id, job_id, freelancer_id, price, days, cover_letter, status, created_at, profiles(id, username, full_name, avatar_url)"
          )
          .eq("job_id", jobId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (!mounted) return;
        setItems((data ?? []) as any);
      } catch (err) {
        toastError(err instanceof Error ? err.message : "加载投标失败");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [jobId, supabase]);

  const hire = async (proposalId: string) => {
    setHiringId(proposalId);
    try {
      const res = await fetch("/api/jobs/hire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, proposalId }),
      });

      const payload = (await res.json().catch(() => null)) as null | { error?: string; url?: string };

      if (!res.ok) {
        toastError(payload?.error || "雇佣失败");
        return;
      }

      if (payload?.url) {
        window.location.href = payload.url;
        return;
      }

      toastError("无法获取支付链接");
    } finally {
      setHiringId(null);
    }
  };

  if (loading) {
    return <div className="mt-4 text-sm text-muted-foreground">加载中...</div>;
  }

  if (!items.length) {
    return <div className="mt-4 text-sm text-muted-foreground">暂无投标</div>;
  }

  return (
    <div className="mt-4 grid gap-3">
      {items.map((p) => {
        const freelancer = (p as any).profiles as any;
        return (
          <div key={p.id} className="border rounded-lg p-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full border overflow-hidden bg-white flex items-center justify-center text-xs text-muted-foreground">
                  {freelancer?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt="avatar"
                      src={freelancer.avatar_url}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "无"
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">
                    {freelancer?.full_name || freelancer?.username || freelancer?.id || "匿名"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString("zh-CN")}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">¥{p.price}</div>
                <div className="text-xs text-muted-foreground">{p.days} 天交付</div>
              </div>
            </div>

            {p.cover_letter ? (
              <div className="mt-3 text-sm whitespace-pre-wrap">{p.cover_letter}</div>
            ) : null}

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
                disabled={hiringId !== null}
                onClick={() => void hire(p.id)}
              >
                {hiringId === p.id ? "处理中..." : "雇佣 (Hire)"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}