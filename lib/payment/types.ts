import { PaymentMethod } from "@prisma/client";

export interface CreatePaymentParams {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  buyerEmail?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  url: string; // 支付跳转链接或二维码链接
  paymentChannelId: string; // 渠道侧的唯一 ID
}

export interface PaymentAdapter {
  createPayment(params: CreatePaymentParams): Promise<PaymentResult>;
  verifyPayment(payload: any, signature?: string): Promise<boolean>;
}
