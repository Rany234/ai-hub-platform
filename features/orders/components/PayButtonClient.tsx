"use client";

import { useState } from "react";
import { Info } from "lucide-react";

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
    <div>
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-300 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-blue-200">沙盒环境 (Sandbox Mode)</div>
            <div className="mt-1 text-sm text-slate-300">
              本交易仅用于测试 T+14 结算协议，不会扣除真实款项。请放心体验流程。
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-md bg-black text-white px-4 py-2 disabled:opacity-60"
      >
        {loading ? "跳转中..." : "去支付"}
      </button>
    </div>
  );
}