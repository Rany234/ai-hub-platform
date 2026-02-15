import type { CreatePaymentParams, PaymentAdapter, PaymentResult } from "./types";

export class WeChatAdapter implements PaymentAdapter {
  async createPayment(_params: CreatePaymentParams): Promise<PaymentResult> {
    throw new Error("WeChat Pay adapter not implemented yet. Configure WECHAT_APP_ID/WECHAT_MCH_ID first.");
  }

  async verifyPayment(): Promise<boolean> {
    return false;
  }
}
