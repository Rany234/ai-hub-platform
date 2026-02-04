"use client";

import { useState } from "react";

export function PayButtonClient({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`支付初始化失败：${data.error ?? "未知错误"}`);
        return;
      }

      if (typeof data.url !== "string" || data.url.trim().length === 0) {
        alert("未获取到支付链接，请稍后重试");
        return;
      }

      window.location.href = data.url;
    } catch (e) {
      console.error("[PayButtonClient] fetch error", e);
      alert("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
    >
      {loading ? "跳转中..." : "去支付"}
    </button>
  );
}