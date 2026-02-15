import { PaymentMethod } from "@prisma/client";

import type { PaymentAdapter } from "./types";
import { StripeAdapter } from "./stripe-adapter";
import { MockAdapter } from "./mock-adapter";
import { WeChatAdapter } from "./wechat-adapter";

function isDev() {
  return process.env.NODE_ENV !== "production";
}

export function getPaymentAdapter(method: PaymentMethod): PaymentAdapter {
  // In dev, allow mock payments even without any credentials
  if (isDev() && method === "OFFLINE") {
    return new MockAdapter();
  }

  if (method === "STRIPE") {
    return new StripeAdapter();
  }

  if (method === "WECHAT") {
    return new WeChatAdapter();
  }

  if (method === "ALIPAY") {
    // Reserved
    return new MockAdapter();
  }

  // OFFLINE in production should not happen in checkout
  return new MockAdapter();
}
