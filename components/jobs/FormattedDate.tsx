"use client";

import { format } from "date-fns";

export default function FormattedDate({ date }: { date?: string | Date | null }) {
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  return <>{format(d, "yyyy-MM-dd HH:mm")}</>;
}
