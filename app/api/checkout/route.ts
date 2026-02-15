export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import { getPaymentAdapter } from "@/lib/payment";

function isPaymentMethod(x: unknown): x is PaymentMethod {
  return x === "STRIPE" || x === "WECHAT" || x === "ALIPAY" || x === "OFFLINE";
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, method } = (await req.json()) as { orderId?: unknown; method?: unknown };

    if (typeof orderId !== "string" || orderId.length === 0) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }

    const paymentMethod: PaymentMethod = isPaymentMethod(method) ? method : "OFFLINE";

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: { select: { title: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not payable" }, { status: 400 });
    }

    const adapter = getPaymentAdapter(paymentMethod);

    const result = await adapter.createPayment({
      orderId: order.id,
      amount: order.amount,
      currency: "cny",
      description: order.listing?.title ?? "服务订单",
      buyerEmail: session?.user?.email ?? undefined,
      metadata: { orderId: order.id },
    });

    // Persist selected method + channel id for later verification / reconciliation
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod,
        paymentChannelId: result.paymentChannelId,
      },
    });

    return NextResponse.json({ url: result.url, paymentChannelId: result.paymentChannelId, method: paymentMethod });
  } catch (e) {
    console.error("[POST /api/checkout]", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
