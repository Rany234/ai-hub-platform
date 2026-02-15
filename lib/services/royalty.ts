import prisma from "@/lib/prisma";

const CREATOR_RATE = 0.9;

export class RoyaltyService {
  static async processOrderEarnings(orderId: string) {
    if (!orderId) return;

    // Idempotency: if sale earning transaction already exists for this order, skip
    const existing = await prisma.transaction.findFirst({
      where: {
        orderId,
        type: "SALE_EARNING",
      },
      select: { id: true },
    });

    if (existing) return;

    // Current schema: Order has a single listing (no items table)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        amount: true,
        listing: {
          select: {
            id: true,
            creatorId: true,
          },
        },
      },
    });

    if (!order) return;

    const creatorId = order.listing?.creatorId;
    if (!creatorId) return;

    // Self-buy: do not pay earnings
    if (creatorId === order.buyerId) return;

    const earning = order.amount * CREATOR_RATE;
    if (!Number.isFinite(earning) || earning <= 0) return;

    await prisma.$transaction(async (tx) => {
      // Re-check inside transaction to avoid race duplicates
      const existingInTx = await tx.transaction.findFirst({
        where: {
          orderId,
          type: "SALE_EARNING",
        },
        select: { id: true },
      });

      if (existingInTx) return;

      await tx.user.update({
        where: { id: creatorId },
        data: {
          earningsBalance: {
            increment: earning,
          },
        },
        select: { id: true },
      });

      await tx.transaction.create({
        data: {
          type: "SALE_EARNING",
          amount: earning,
          orderId,
          beneficiaryId: creatorId,
        },
        select: { id: true },
      });
    });
  }
}

export { CREATOR_RATE };
