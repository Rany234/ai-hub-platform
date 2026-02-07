import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export const dynamic = "force-dynamic";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });
    }

    const { orderId } = (await req.json()) as { orderId?: unknown };

    if (typeof orderId !== "string" || orderId.length === 0) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, listing_id, amount, status")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json({ error: "Order is not payable" }, { status: 400 });
    }

    const { data: listing } = await supabase
      .from("listings")
      .select("title")
      .eq("id", order.listing_id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const unitAmount = Math.round(Number(order.amount) * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: {
              name: listing?.title ?? "服务订单",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/orders/${orderId}?success=true`,
      cancel_url: `${baseUrl}/dashboard/orders/${orderId}?canceled=true`,
      metadata: {
        orderId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error("[POST /api/checkout]", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
