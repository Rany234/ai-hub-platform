import { cn } from "@/lib/utils";

type StatusVariant = "pending" | "paid" | "delivered" | "completed" | "cancelled";

const variantMap: Record<StatusVariant, { bg: string; text: string; label: string }> = {
  pending: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    label: "等待支付",
  },
  paid: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    label: "进行中",
  },
  delivered: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    label: "待验收",
  },
  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    label: "已完成",
  },
  cancelled: {
    bg: "bg-red-100",
    text: "text-red-700",
    label: "已取消",
  },
};

export function StatusBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const key = status?.toLowerCase() as StatusVariant | undefined;
  const cfg = key ? variantMap[key] : null;

  if (!cfg) {
    return (
      <span className={cn("rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700", className)}>
        {status ?? "未知"}
      </span>
    );
  }

  return (
    <span className={cn("rounded-full px-2 py-1 text-xs font-medium", cfg.bg, cfg.text, className)}>
      {cfg.label}
    </span>
  );
}
