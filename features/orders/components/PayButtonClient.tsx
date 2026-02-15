"use client";

import { useState } from "react";
import { Info, Loader2, CreditCard, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type PaymentMethod = "WECHAT" | "ALIPAY" | "STRIPE" | "OFFLINE";

interface PaymentOption {
  id: PaymentMethod;
  name: string;
  icon: React.ReactNode;
  description: string;
  isDev?: boolean;
}

export function PayButtonClient({ orderId }: { orderId: string }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("WECHAT");

  const isDev = process.env.NODE_ENV === "development";

  const paymentOptions: PaymentOption[] = [
    {
      id: "WECHAT",
      name: "微信支付",
      icon: <Wallet className="h-5 w-5 text-emerald-500" />,
      description: "使用微信扫码支付",
    },
    {
      id: "ALIPAY",
      name: "支付宝",
      icon: <Wallet className="h-5 w-5 text-blue-500" />,
      description: "使用支付宝手机或网页支付",
    },
    {
      id: "STRIPE",
      name: "国际卡支付 (Stripe)",
      icon: <CreditCard className="h-5 w-5 text-indigo-500" />,
      description: "支持 Visa / MasterCard",
    },
    ...(isDev
      ? [
          {
            id: "OFFLINE" as const,
            name: "模拟支付 (Dev Only)",
            icon: <CheckCircle2 className="h-5 w-5 text-amber-500" />,
            description: "开发环境专用，点击即成功",
            isDev: true,
          },
        ]
      : []),
  ];

  const handleStartPayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, method: selectedMethod }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(`支付初始化失败：${data.error ?? "未知错误"}`);
        return;
      }

      if (typeof data.url !== "string" || data.url.trim().length === 0) {
        toast.error("未获取到支付链接，请稍后重试");
        return;
      }

      // 跳转到支付页面（Stripe 或 Mock Success）
      window.location.href = data.url;
    } catch (e) {
      console.error("[PayButtonClient] checkout error", e);
      toast.error("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-300 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-blue-200">收银台已就绪</div>
            <div className="mt-1 text-sm text-slate-300">
              请选择您偏好的支付方式。所有交易均受托管协议保护。
            </div>
          </div>
        </div>
      </div>

      <Button
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-brand-action hover:bg-brand-action/90 text-black font-bold py-6 text-lg rounded-xl shadow-lg shadow-brand-action/20 transition-all"
      >
        立即去支付
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">选择支付方式</DialogTitle>
            <DialogDescription className="text-slate-400">
              请选择一个支付渠道完成您的订单支付
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {paymentOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => setSelectedMethod(option.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedMethod === option.id
                    ? "border-brand-action bg-brand-action/10"
                    : "border-slate-800 bg-slate-800/50 hover:border-slate-700"
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedMethod === option.id ? "bg-brand-action/20" : "bg-slate-700"}`}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{option.name}</div>
                  <div className="text-xs text-slate-500">{option.description}</div>
                </div>
                {selectedMethod === option.id && (
                  <div className="h-4 w-4 rounded-full bg-brand-action border-4 border-slate-900 shadow-sm" />
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
        disabled={loading}
              onClick={handleStartPayment}
              className="w-full bg-brand-action hover:bg-brand-action/90 text-black font-bold py-4 rounded-xl"
      >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在跳转...
                </>
              ) : (
                "确认支付"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
