"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast";

export function JobFormClient() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toastError("请先登录");
        return;
      }

      const parsedBudget = Number(budget);
      if (!title.trim()) {
        toastError("请填写标题");
        return;
      }
      if (Number.isNaN(parsedBudget) || parsedBudget <= 0) {
        toastError("请填写正确的预算金额");
        return;
      }

      const { error } = await supabase.from("jobs").insert({
        creator_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        budget: parsedBudget,
        deadline: deadline ? deadline : null,
        status: "open",
      });

      if (error) {
        toastError(error.message);
        return;
      }

      router.push("/jobs");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-1">
        <div className="text-sm font-medium">标题</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          placeholder="例如：需要一个 Midjourney 图集生成工作流"
        />
      </div>

      <div className="grid gap-1">
        <div className="text-sm font-medium">详细描述</div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm min-h-32"
          placeholder="请尽量描述清楚需求、交付格式、参考样例等"
        />
      </div>

      <div className="grid gap-1">
        <div className="text-sm font-medium">预算金额 (¥)</div>
        <input
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
          inputMode="decimal"
          placeholder="例如：500"
        />
      </div>

      <div className="grid gap-1">
        <div className="text-sm font-medium">期望交付日期</div>
        <input
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "提交中..." : "发布"}
        </button>
      </div>
    </form>
  );
}