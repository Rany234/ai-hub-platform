"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";

import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  getNotifications,
  markAllAsRead,
  markAsRead,
} from "@/app/actions/notification";

type NotificationRow = {
  id: string;
  title?: string | null;
  content?: string | null;
  body?: string | null;
  link?: string | null;
  is_read?: boolean | null;
  created_at?: string | null;
};

function formatTime(ts?: string | null) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [isPending, startTransition] = useTransition();

  const unreadCount = useMemo(
    () => items.filter((n) => !n.is_read).length,
    [items]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = (await getNotifications()) as any[];
        if (cancelled) return;
        setItems(data ?? []);
      } catch {
        if (cancelled) return;
        setItems([]);
      }
    }

    if (open) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllAsRead();
      const data = (await getNotifications()) as any[];
      setItems(data ?? []);
    });
  };

  const handleItemClick = (n: NotificationRow) => {
    startTransition(async () => {
      if (!n.is_read) {
        await markAsRead(n.id);
      }
      setOpen(false);
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 ? (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 max-w-[90vw]">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>通知</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleMarkAll}
            disabled={isPending || items.length === 0 || unreadCount === 0}
          >
            全部标为已读
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {items.length === 0 ? (
          <div className="px-3 py-6 text-sm text-muted-foreground text-center">
            暂无通知
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-auto">
            {items.map((n) => {
              const isRead = Boolean(n.is_read);
              const title = n.title ?? "通知";
              const content = n.content ?? n.body ?? "";
              const link = n.link ?? null;

              return (
                <div key={n.id}>
                  <DropdownMenuItem
                    className={
                      "flex flex-col items-start gap-1 px-3 py-2 cursor-pointer " +
                      (isRead ? "opacity-70" : "bg-muted/30")
                    }
                    onClick={() => handleItemClick(n)}
                  >
                    <div className="w-full flex items-center justify-between gap-3">
                      <div className="font-medium text-sm truncate">{title}</div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {formatTime(n.created_at)}
                      </div>
                    </div>
                    {content ? (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {content}
                      </div>
                    ) : null}
                    {link ? (
                      <div className="text-xs">
                        <Link
                          href={link}
                          className="text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleItemClick(n);
                          }}
                        >
                          查看详情
                        </Link>
                      </div>
                    ) : null}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </div>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
