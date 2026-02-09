"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function FormattedDate({ date }: { date?: string | Date | null }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <span className="animate-pulse">...</span>;
  if (!date) return null;

  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  return <>{format(d, "yyyy-MM-dd HH:mm")}</>;
}
