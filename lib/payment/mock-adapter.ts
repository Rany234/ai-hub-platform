import type { CreatePaymentParams, PaymentAdapter, PaymentResult } from "./types";

export class MockAdapter implements PaymentAdapter {
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Simulate a channel id
    const paymentChannelId = `mock_${Date.now()}_${Math.random().toString(36).slice(2)}`;

    // Redirect to internal mock success endpoint which will mark the order as paid
    const url = `${baseUrl}/api/payments/mock/success?orderId=${encodeURIComponent(
      params.orderId
    )}&channelId=${encodeURIComponent(paymentChannelId)}`;

    return { url, paymentChannelId };
  }

  async verifyPayment(): Promise<boolean> {
    return true;
  }
}
