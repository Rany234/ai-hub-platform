"use client";

import dynamic from "next/dynamic";

const NotificationBell = dynamic(
  () => import("./NotificationBell").then((m) => m.NotificationBell),
  { ssr: false }
);

export default function BellWrapper() {
  return <NotificationBell />;
}
