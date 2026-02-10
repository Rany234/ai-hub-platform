"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { setListingModerationStatusAction } from "@/features/admin/actions";

type Props = {
  listing: {
    id: string;
    title: string;
    price: string | number;
    status: string;
    created_at: string;
    preview_url: string | null;
    creator_id: string;
    profiles?: {
      id: string;
      username: string | null;
      full_name: string | null;
      avatar_url: string | null;
    } | null;
  };
};

function statusBadge(status: string) {
  if (status === "active") return { text: "Active", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" };
  if (status === "banned") return { text: "Banned", cls: "bg-red-500/10 text-red-400 border-red-500/20" };
  if (status === "archived") return { text: "Archived", cls: "bg-slate-800 text-slate-400 border-slate-700" };
  return { text: status, cls: "bg-slate-800 text-slate-400 border-slate-700" };
}

export function AdminListingRow({ listing }: Props) {
  const [banState, banAction] = useActionState(setListingModerationStatusAction, null);
  const [unbanState, unbanAction] = useActionState(setListingModerationStatusAction, null);
  const [pending, setPending] = useState(false);

  const onBan = async () => {
    setPending(true);
    const form = new FormData();
    form.set("listingId", listing.id);
    form.set("status", "banned");
    await banAction(form);
    setPending(false);
  };

  const onUnban = async () => {
    setPending(true);
    const form = new FormData();
    form.set("listingId", listing.id);
    form.set("status", "active");
    await unbanAction(form);
    setPending(false);
  };

  const tag = statusBadge(listing.status);
  const creator = listing.profiles ?? null;

  return (
    <tr className="border-t">
      <td className="p-3">
        {listing.preview_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt="preview"
            src={listing.preview_url}
            className="h-12 w-12 rounded object-cover border"
          />
        ) : (
          <div className="h-12 w-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            无图
          </div>
        )}
      </td>
      <td className="p-3">
        <div className="truncate max-w-[200px]" title={listing.title}>
          {listing.title}
        </div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full border border-white/10 overflow-hidden bg-slate-800 flex items-center justify-center text-xs text-slate-300">
            {creator?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img alt="avatar" src={creator.avatar_url} className="h-full w-full object-cover" />
            ) : (
              "无"
            )}
          </div>
          <div className="truncate max-w-[120px]" title={creator?.full_name || creator?.username || creator?.id || "未知"}>
            {creator?.full_name || creator?.username || creator?.id || "未知"}
          </div>
        </div>
      </td>
      <td className="p-3">¥{listing.price}</td>
      <td className="p-3">
        <span className={`text-xs border rounded-full px-2 py-0.5 ${tag.cls}`}>{tag.text}</span>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Link
            className="text-xs underline text-muted-foreground"
            href={`/listings/${listing.id}`}
            target="_blank"
            rel="noreferrer"
          >
            查看
          </Link>

          {listing.status === "active" ? (
            <button
              type="button"
              className="text-xs underline text-red-600 disabled:opacity-50"
              onClick={onBan}
              disabled={pending}
            >
              {pending ? "处理中..." : "封禁"}
            </button>
          ) : null}

          {listing.status === "banned" ? (
            <button
              type="button"
              className="text-xs underline text-green-600 disabled:opacity-50"
              onClick={onUnban}
              disabled={pending}
            >
              {pending ? "处理中..." : "解封"}
            </button>
          ) : null}
        </div>
      </td>
    </tr>
  );
}
