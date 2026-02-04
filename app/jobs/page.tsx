import Link from "next/link";

import { JobsPageClient } from "./page.client";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ min?: string; max?: string }>;
}) {
  const sp = await searchParams;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">任务大厅</h1>
        <Link className="rounded-md bg-black text-white px-4 py-2 text-sm" href="/jobs/create">
          发布需求
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <aside className="border rounded-lg p-4 h-fit">
          <div className="text-sm font-semibold">筛选</div>
          <form className="mt-4 grid gap-3">
            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">预算最低 (¥)</div>
              <input
                name="min"
                defaultValue={sp.min ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
                inputMode="decimal"
              />
            </div>
            <div className="grid gap-1">
              <div className="text-xs text-muted-foreground">预算最高 (¥)</div>
              <input
                name="max"
                defaultValue={sp.max ?? ""}
                className="rounded-md border px-3 py-2 text-sm"
                inputMode="decimal"
              />
            </div>
            <button type="submit" className="rounded-md border px-3 py-2 text-sm">
              应用
            </button>
          </form>
        </aside>

        <JobsPageClient min={sp.min} max={sp.max} />
      </div>
    </div>
  );
}
