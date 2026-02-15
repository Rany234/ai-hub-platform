export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { RoyaltyService } from "@/lib/services/royalty";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  const channelId = req.nextUrl.searchParams.get("channelId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  // Mark as paid in dev mock mode
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "paid",
      escrowStatus: "held",
      paymentMethod: "OFFLINE",
      paymentChannelId: channelId ?? null,
    },
  });

  // Process royalty earnings after payment
  try {
    await RoyaltyService.processOrderEarnings(orderId);
  } catch (error) {
    console.error("[Royalty] Failed to process earnings for order:", orderId, error);
    // We don't block the main flow if royalty processing fails
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return NextResponse.redirect(`${baseUrl}/dashboard/orders/${encodeURIComponent(orderId)}?success=true`);
}
