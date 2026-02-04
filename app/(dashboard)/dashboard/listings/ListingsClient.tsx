"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { toastError } from "@/lib/toast";

type ListingRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string | null;
  created_at: string;
};

export function ListingsClient({ listings }: { listings: ListingRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      const payload = (await res.json().catch(() => null)) as null | { error?: string };

      if (!res.ok) {
        toastError(payload?.error || "删除失败");
        return;
      }

      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {listings.map((listing) => (
        <div
          key={listing.id}
          className="border rounded-lg p-4 flex items-start justify-between gap-4"
        >
          <div className="flex-1">
            <div className="font-semibold">{listing.title}</div>
            {listing.description ? (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {listing.description}
              </p>
            ) : null}
            <div className="mt-2 text-xs text-muted-foreground">
              状态：{listing.status ?? "未知"} | 价格：¥{listing.price}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            <Link
              className="text-sm underline text-muted-foreground"
              href={`/listings/${listing.id}`}
              target="_blank"
              rel="noreferrer"
            >
              查看
            </Link>

            <div className="flex items-center gap-3 text-sm">
              <Link className="underline" href={`/dashboard/listings/${listing.id}/edit`}>
                编辑
              </Link>
              <button
                type="button"
                className="underline text-red-600 disabled:opacity-50"
                onClick={() => void onDelete(listing.id)}
                disabled={deletingId !== null}
              >
                {deletingId === listing.id ? "删除中..." : "删除"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
