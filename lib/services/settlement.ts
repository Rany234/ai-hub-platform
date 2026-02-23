import {
  ActorType,
  BeneficiaryType,
  DeliveryStatus,
  LedgerDirection,
  NotificationType,
  OrderActionType,
  OrderStatus,
  TransactionType,
} from "@prisma/client";

import prisma from "@/lib/prisma";

const PLATFORM_FEE_BPS = 500; // Phase 1: 平台固定抽成 5% (500 Basis Points)

/**
 * 核心分账引擎 (Phase 1: 内扣模式)
 * 升级 (Phase 2): 增加主从订单校验逻辑
 *
 * 必须在 Prisma 事务 ($transaction) 内部调用
 */
export async function executeOrderSettlement(tx: any, order: any) {
  // 1. 基础校验：防止重复结算
  if (order.status === "completed" || order.settledAt) {
    throw new Error("结算异常：订单已处于完成或已结算状态");
  }

  // 2. Phase 2/3: 主从结算协议校验 + 子任务成本聚合
  // - 如果当前是父订单，必须确保所有子订单已结清（completed 或 cancelled）
  // - Phase 3: 统计所有已结算子单成本，用于从父单净收入中精准抵扣
  const subOrders = await tx.order.findMany({
    where: { parentId: order.id },
    select: { id: true, status: true, isSubOrder: true, amountCents: true, settledAt: true },
  });

  if (subOrders.length > 0) {
    const unfinishedSubOrders = subOrders.filter(
      (so: any) => so.status !== OrderStatus.completed && so.status !== OrderStatus.cancelled
    );

    if (unfinishedSubOrders.length > 0) {
      throw new Error(
        `结算拦截：主订单 ${order.id} 仍有 ${unfinishedSubOrders.length} 个子任务未结清，请先完成子任务结算。`
      );
    }
  }

  // Phase 3: 提取子订单 ID 列表
  const subOrderIds = subOrders.map((so: any) => so.id).filter(Boolean);

  // Phase 3: 聚合真实支出流水（以 Transaction 表为唯一真相）
  // 仅统计实际发给协作者的钱：子订单的 SELLER_EARNING
  const subOrderLedger = subOrderIds.length
    ? await tx.transaction.aggregate({
        _sum: { amountCents: true },
        where: {
          orderId: { in: subOrderIds },
          type: TransactionType.SELLER_EARNING,
        },
      })
    : { _sum: { amountCents: 0 } };

  const totalSubOrderCostCents = subOrderLedger._sum.amountCents || 0;

  // SellerId is required for settlement; prefer using preloaded order.listing.freelancerProfile.userId.
  // Fallback to an extra query ONLY when missing to make the settlement engine resilient.
  let sellerId: string | undefined = order.listing?.freelancerProfile?.userId;
  if (!sellerId) {
    const refreshed = await tx.order.findUnique({
      where: { id: order.id },
      select: {
        listing: {
          select: {
            freelancerProfile: {
              select: { userId: true },
            },
          },
        },
      },
    });

    sellerId = (refreshed as any)?.listing?.freelancerProfile?.userId as string | undefined;
  }

  if (!sellerId) {
    throw new Error(
      `结算异常：订单数据缺失卖家信息 (orderId=${order.id}, listingId=${order.listingId}, buyerId=${order.buyerId}, isSubOrder=${!!order.isSubOrder}, parentId=${order.parentId || "none"})`
    );
  }

  const gross = order.amountCents;
  const platformFeeCents = Math.round((gross * PLATFORM_FEE_BPS) / 10000);

  // 计算 QA 费用：仅当启用了 QA 且指定了专家时才扣除
  const qaFeeCents =
    order.isQAEnabled && order.qaAuditorId ? Math.round((gross * (order.qaFeeRateBps || 500)) / 10000) : 0;

  // Phase 3: 主接单人净收入 = 总价 - 平台抽成 - QA抽成 - 已结算子任务成本
  const sellerNetCents = gross - platformFeeCents - qaFeeCents - totalSubOrderCostCents;

  // 风控拦截：分包成本不允许超过订单净收益
  if (sellerNetCents < 0) {
    throw new Error("严重结算异常：分包成本超过订单净收益，系统拒绝结算");
  }

  // 1. 记录卖家收入流水 (硬幂等写入：唯一约束即是锁)
  const sellerIdempotencyKey = `${order.id}-SELLER_EARNING`;
  try {
    await tx.transaction.create({
      data: {
        type: TransactionType.SELLER_EARNING,
        idempotencyKey: sellerIdempotencyKey,
        beneficiaryType: BeneficiaryType.USER,
        beneficiaryId: sellerId,
        sourceUserId: order.buyerId,
        direction: LedgerDirection.CREDIT,
        amount: sellerNetCents / 100,
        amountCents: sellerNetCents,
        orderId: order.id,
        metadata: {
          gross,
          platformFeeCents,
          qaFeeCents,
          totalSubOrderCostCents,
          role: "seller",
        },
      },
    });

    // 1.1 只有首次创建流水成功（未触发唯一冲突）时，才更新卖家虚拟余额
    await tx.user.update({
      where: { id: sellerId },
      data: { earningsBalanceCents: { increment: sellerNetCents } },
    });
  } catch (e: any) {
    // Prisma 唯一约束冲突错误码: P2002
    // 注意：在 Driver Adapter 下 meta.target 结构不稳定，因此只要是 P2002 就视为幂等冲突（已结算）
    if (e?.code === "P2002") {
      if (process.env.SETTLEMENT_DEBUG === "1") {
        console.log(
          `[Settlement] Detected idempotency conflict (orderId=${order.id}, key=${sellerIdempotencyKey}). Skipping balance increment.`
        );
      }
      return { alreadySettled: true, sellerNetCents, platformFeeCents, qaFeeCents };
    }
    throw e; // 其他错误正常抛出
  }

  // 2. 记录平台抽成流水 (硬幂等写入)
  const platformIdempotencyKey = `${order.id}-PLATFORM_FEE`;
  try {
    await tx.transaction.create({
      data: {
        type: TransactionType.PLATFORM_FEE,
        idempotencyKey: platformIdempotencyKey,
        beneficiaryType: BeneficiaryType.PLATFORM,
        sourceUserId: order.buyerId,
        direction: LedgerDirection.CREDIT,
        amount: platformFeeCents / 100,
        amountCents: platformFeeCents,
        orderId: order.id,
        metadata: { rateBps: PLATFORM_FEE_BPS, role: "platform" },
      },
    });
  } catch (e: any) {
    if (e.code !== "P2002") throw e;
  }

  // 3. 记录 QA 专家收入 (硬幂等写入)
  if (qaFeeCents > 0 && order.qaAuditorId) {
    const qaIdempotencyKey = `${order.id}-QA_FEE`;
    try {
      await tx.transaction.create({
        data: {
          type: TransactionType.QA_FEE,
          idempotencyKey: qaIdempotencyKey,
          beneficiaryType: BeneficiaryType.USER,
          beneficiaryId: order.qaAuditorId,
          sourceUserId: order.buyerId,
          direction: LedgerDirection.CREDIT,
          amount: qaFeeCents / 100,
          amountCents: qaFeeCents,
          orderId: order.id,
          metadata: { rateBps: order.qaFeeRateBps, role: "qa_auditor" },
        },
      });

      await tx.user.update({
        where: { id: order.qaAuditorId },
        data: { earningsBalanceCents: { increment: qaFeeCents } },
      });
    } catch (e: any) {
      if (e.code !== "P2002") throw e;
    }
  }

  // 4. 固化订单结算状态与金额
  await tx.order.update({
    where: { id: order.id },
    data: {
      status: OrderStatus.completed,
      settledAt: new Date(),
      qaFeeCents: qaFeeCents,
    },
  });

  return { alreadySettled: false, sellerNetCents, platformFeeCents, qaFeeCents };
}

/**
 * 超时自动跳过专家审计 (Phase 1)
 * 升级 (Phase 2): 规范化 ActorType 为 SYSTEM
 */
export async function autoSkipExpiredQA(): Promise<{ processed: number; orderIds: string[] }> {
  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      deliveryStatus: DeliveryStatus.AUDITING,
      qaDeadlineAt: {
        lte: now,
      },
    },
    select: {
      id: true,
      buyerId: true,
      qaAuditorId: true,
      qaFeeCents: true,
      qaDeadlineAt: true,
      deliveryStatus: true,
      escrowStatus: true,
    },
  });

  if (expiredOrders.length === 0) {
    return { processed: 0, orderIds: [] };
  }

  const processedOrderIds: string[] = [];

  for (const order of expiredOrders) {
    await prisma.$transaction(async (tx) => {
      // 1) 推进状态：AUDITING -> DELIVERED
      await tx.order.update({
        where: { id: order.id },
        data: {
          deliveryStatus: DeliveryStatus.DELIVERED,
          qaFeeCents: 0,
        },
      });

      // 2) 审计日志 (ActorType: SYSTEM)
      await tx.orderEventLog.create({
        data: {
          orderId: order.id,
          userId: order.buyerId, 
          actorType: ActorType.SYSTEM,
          action: OrderActionType.QA_TIMED_OUT_SKIP,
          fromStatus: DeliveryStatus.AUDITING,
          toStatus: DeliveryStatus.DELIVERED,
          comment: "系统因 48h 审计超时自动跳过",
          metadata: {
            reason: "QA_TIMEOUT_AUTO_SKIP",
            message: "系统因 48h 审计超时自动跳过",
            qaDeadlineAt: order.qaDeadlineAt?.toISOString?.() ?? order.qaDeadlineAt,
          },
        },
      });

      // 3) 通知买家
      await (tx as any).notification.create({
        data: {
          userId: order.buyerId,
          type: NotificationType.ORDER_UPDATE as any,
          title: "专家审计已超时 · 系统自动跳过",
          content: `订单 ${order.id} 的专家审计已超时（48h），系统已自动跳过审计流程，您现在可以查阅交付物并进行验收。`,
          link: `/dashboard/orders/${encodeURIComponent(order.id)}#delivery-panel`,
          isRead: false,
        },
      });
    });

    processedOrderIds.push(order.id);
  }

  return { processed: processedOrderIds.length, orderIds: processedOrderIds };
}
