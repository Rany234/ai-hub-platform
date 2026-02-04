export const orderStatusMap = {
  pending: "待付款",
  paid: "已付款（资金托管中）",
  delivered: "待验收 (In Review)",
  completed: "交易完成",
  disputed: "纠纷处理中",
} as const;

export const escrowStatusMap = {
  held: "资金托管中",
  released: "已打款给卖家",
  refunded: "已退款",
} as const;

export function formatOrderStatus(status: string | null | undefined) {
  if (!status) return "未知状态";
  return (orderStatusMap as Record<string, string>)[status] ?? status;
}

export function formatEscrowStatus(status: string | null | undefined) {
  if (!status) return "未知状态";
  return (escrowStatusMap as Record<string, string>)[status] ?? status;
}
