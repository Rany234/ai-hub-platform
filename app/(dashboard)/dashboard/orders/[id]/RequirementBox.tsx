"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, MessageSquare } from "lucide-react";

import { updateOrderRequirements } from "@/features/orders/actions";

export function RequirementBox({
  orderId,
  initialRequirements,
  disabled,
}: {
  orderId: string;
  initialRequirements: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialRequirements);
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (saving || disabled) return;
    setSaving(true);
    try {
      const res = await updateOrderRequirements(orderId, value);
      if (!res.success) {
        toast.error(res.error || "更新失败");
        return;
      }
      toast.success("需求已更新");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "更新失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-[#151F32] border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-bold text-white">需求 / 留言板</h2>
      </div>

      <textarea
        className="w-full bg-[#0B1121] border border-white/10 rounded-xl px-4 py-2.5 text-slate-100 placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/50 transition-all min-h-[120px]"
        placeholder="补充你的需求、验收标准、交付格式等..."
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        type="button"
        onClick={onSave}
        disabled={disabled || saving}
        className="mt-4 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-white py-3 font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          "保存需求"
        )}
      </button>
    </div>
  );
}
