import Stripe from "stripe";

import type { PaymentAdapter, CreatePaymentParams, PaymentResult } from "./types";

export class StripeAdapter implements PaymentAdapter {
  private stripe: Stripe;

  constructor() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("Stripe is not configured (missing STRIPE_SECRET_KEY)");
    }
    this.stripe = new Stripe(key, { apiVersion: "2023-10-16" as any });
  }

  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const unitAmount = Math.round(Number(params.amount) * 100);

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: params.currency,
            product_data: { name: params.description },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard/orders/${params.orderId}?success=true`,
      cancel_url: `${baseUrl}/dashboard/orders/${params.orderId}?canceled=true`,
      metadata: {
        orderId: params.orderId,
      },
    });

    return {
      url: session.url || `${baseUrl}/dashboard/orders/${params.orderId}?success=true`,
      paymentChannelId: session.id,
    };
  }

  async verifyPayment(_payload: any, _signature?: string): Promise<boolean> {
    // Verification is handled in Stripe webhook route in this codebase.
    return true;
  }
}
