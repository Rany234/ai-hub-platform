"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast";

type JobRow = {
  id: string;
  title: string;
  description: string | null;
  budget: string | number;
  deadline: string | null;
  status: string;
  created_at: string;
};

function statusLabel(status: string) {
  if (status === "open") return { text: "Open", cls: "bg-green-50 text-green-700 border-green-200" };
  if (status === "in_progress")
    return { text: "In Progress", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" };
  if (status === "completed")
    return { text: "Completed", cls: "bg-gray-50 text-gray-700 border-gray-200" };
  if (status === "cancelled")
    return { text: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200" };
  return { text: status, cls: "bg-gray-50 text-gray-700 border-gray-200" };
}

export function JobsClient({ jobs }: { jobs: JobRow[] }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const [closingId, setClosingId] = useState<string | null>(null);

  const closeJob = async (id: string) => {
    const ok = window.confirm("Are you sure?");
    if (!ok) return;

    setClosingId(id);
    try {
      const { error } = await supabase.from("jobs").update({ status: "cancelled" }).eq("id", id);
      if (error) {
        toastError(error.message);
        return;
      }
      router.refresh();
    } finally {
      setClosingId(null);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {jobs.map((job) => {
        const tag = statusLabel(job.status);

        return (
          <div key={job.id} className="border rounded-lg p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{job.title}</div>
                <span className={`text-xs border rounded-full px-2 py-0.5 ${tag.cls}`}>{tag.text}</span>
              </div>

              {job.description ? (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{job.description}</p>
              ) : null}

              <div className="mt-2 text-xs text-muted-foreground">
                预算：¥{job.budget}
                {job.deadline ? ` | 交付：${new Date(job.deadline).toLocaleDateString("zh-CN")}` : ""}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Link className="text-sm underline text-muted-foreground" href={`/dashboard/jobs/${job.id}`}>
                查看投标
              </Link>

              <button
                type="button"
                className="text-sm underline text-red-600 disabled:opacity-50"
                onClick={() => void closeJob(job.id)}
                disabled={closingId !== null || job.status === "cancelled"}
              >
                {closingId === job.id ? "关闭中..." : job.status === "cancelled" ? "已关闭" : "关闭任务"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
