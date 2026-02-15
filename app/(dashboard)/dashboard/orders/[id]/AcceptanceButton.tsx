"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { completeOrderAction } from "@/features/orders/actions";

export default function AcceptanceButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const res = await completeOrderAction(orderId);
      if (res.success) {
        toast.success("订单验收成功！");
      } else {
        toast.error(res.error || "验收失败");
      }
    } catch (error) {
      toast.error("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 flex flex-col items-center gap-4 p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
      <div className="text-center space-y-1">
        <div className="text-emerald-400 font-bold flex items-center justify-center gap-2">
          <CheckCircle2 className="h-5 w-5" />
          卖家已完成交付
        </div>
        <p className="text-sm text-slate-400">请检查交付成果，确认无误后点击下方按钮验收</p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            disabled={loading}
            className="w-full max-w-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "确认验收成果"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>确认验收交付成果？</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              确认验收后，托管资金将立即结算给卖家。此操作不可撤销，请确保您已收到满意的成果。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleAccept}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold"
            >
              确认验收并打款
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
