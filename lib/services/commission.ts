import prisma from "@/lib/prisma";

const COMMISSION_RATE = 0.1; // 10%

export class CommissionService {
  static async processCommission(orderId: string) {
    if (!orderId) return;

    // Idempotency: if commission transaction already exists, skip
    const existing = await prisma.transaction.findFirst({
      where: {
        orderId,
        type: "COMMISSION",
      },
      select: { id: true },
    });

    if (existing) return;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        amount: true,
        buyerId: true,
      },
    });

    if (!order) return;

    const buyer = await prisma.user.findUnique({
      where: { id: order.buyerId },
      select: {
        id: true,
        referredBy: true,
      },
    });

    const referrerId = buyer?.referredBy;
    if (!referrerId) return;

    const commissionAmount = order.amount * COMMISSION_RATE;
    if (!Number.isFinite(commissionAmount) || commissionAmount <= 0) return;

    await prisma.$transaction(async (tx) => {
      // Re-check inside transaction to avoid race duplicates
      const existingInTx = await tx.transaction.findFirst({
        where: {
          orderId,
          type: "COMMISSION",
        },
        select: { id: true },
      });

      if (existingInTx) return;

      await tx.user.update({
        where: { id: referrerId },
        data: {
          earningsBalance: {
            increment: commissionAmount,
          },
        },
        select: { id: true },
      });

      await tx.transaction.create({
        data: {
          type: "COMMISSION",
          amount: commissionAmount,
          orderId,
          beneficiaryId: referrerId,
        },
        select: { id: true },
      });
    });
  }
}

export { COMMISSION_RATE };
