"use client";

import { format } from "date-fns";

export default function ClientDate({
  date,
  formatStr = "yyyy-MM-dd HH:mm",
}: {
  date?: string | Date | null;
  formatStr?: string;
}) {
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  return <>{format(d, formatStr)}</>;
}
