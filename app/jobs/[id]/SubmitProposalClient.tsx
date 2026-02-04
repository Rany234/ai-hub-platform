"use client";

import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast";

function toastSuccess(message: string) {
  if (typeof window !== "undefined") {
    window.alert(message);
  }
}

type Props = {
  jobId: string;
};

export function SubmitProposalClient({ jobId }: Props) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [days, setDays] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toastError("请先登录");
        return;
      }

      const p = Number(price);
      const d = Number(days);

      if (Number.isNaN(p) || p <= 0) {
        toastError("请填写正确的报价");
        return;
      }
      if (Number.isNaN(d) || d <= 0) {
        toastError("请填写正确的预计天数");
        return;
      }

      const { error } = await supabase.from("proposals").insert({
        job_id: jobId,
        freelancer_id: user.id,
        price: p,
        days: d,
        cover_letter: coverLetter.trim() || null,
        status: "pending",
      });

      if (error) {
        toastError(error.message);
        return;
      }

      setOpen(false);
      toastSuccess("投标成功");
      window.location.reload();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md bg-black text-white px-4 py-2 text-sm"
      >
        立即投标
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white border shadow">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="text-sm font-semibold">提交投标</div>
              <button
                type="button"
                className="text-sm text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                关闭
              </button>
            </div>

            <div className="p-4 grid gap-3">
              <div className="grid gap-1">
                <div className="text-sm font-medium">报价 (¥)</div>
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                  inputMode="decimal"
                  placeholder="例如：800"
                />
              </div>

              <div className="grid gap-1">
                <div className="text-sm font-medium">预计交付时间 (天)</div>
                <input
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm"
                  inputMode="numeric"
                  placeholder="例如：7"
                />
              </div>

              <div className="grid gap-1">
                <div className="text-sm font-medium">自荐信</div>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="rounded-md border px-3 py-2 text-sm min-h-28"
                  placeholder="简要说明你的方案、经验与优势"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="rounded-md border px-4 py-2 text-sm"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  取消
                </button>
                <button
                  type="button"
                  className="rounded-md bg-black text-white px-4 py-2 text-sm disabled:opacity-50"
                  onClick={() => void submit()}
                  disabled={submitting}
                >
                  {submitting ? "提交中..." : "提交"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}