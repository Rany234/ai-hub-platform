"use client";

import { Hammer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BidDrawer } from "@/components/bids/BidDrawer";

export function BidButtonWithDrawer({ jobId }: { jobId: string }) {
  return (
    <BidDrawer
      jobId={jobId}
      trigger={
        <Button
          size="lg"
          className="w-full rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-700 to-indigo-900 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] shadow-blue-500/50 transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
        >
          <Hammer className="mr-2 h-5 w-5" />
          立即投标
        </Button>
      }
    />
  );
}
