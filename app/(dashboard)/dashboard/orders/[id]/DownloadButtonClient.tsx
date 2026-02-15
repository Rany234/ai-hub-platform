"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function DownloadButtonClient({ deliveryId }: { deliveryId: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.error ?? "获取下载链接失败");
        return;
      }

      if (typeof data.url !== "string" || data.url.length === 0) {
        alert("服务端未返回下载链接");
        return;
      }

      window.open(data.url, "_blank");
    } catch (e) {
      alert("网络错误");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors flex items-center gap-1 disabled:opacity-60"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
      下载附件
    </button>
  );
}
