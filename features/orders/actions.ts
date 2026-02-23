"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/utils";
import { executeOrderSettlement } from "@/lib/services/settlement";
import type { ActionResult } from "@/types/actions";
import { 
  ActorType,
  DeliveryStatus, 
  EscrowStatus, 
  OrderActionType,
  OrderStatus,
  QAOutcome,
  SubOrderType
} from "@prisma/client";

// --- 通用类型定义 ---

export type OrderWithBuyerListing = any;
export type OrderWithBuyerListingDeliveries = any;

export type CreateOrderResult =
  | { success: true; data: OrderWithBuyerListing }
  | {
      success: false;
      error: string;
      code?: "UNAUTHORIZED" | "NOT_FOUND" | "DEMO_DISABLED" | "INVALID_OPTIONS" | "UNKNOWN";
      details?: string;
    };

function isDemoListing(listing: { metadata: unknown } | null | undefined): boolean {
  const metadata = listing?.metadata as any;
  return Boolean(metadata && typeof metadata === "object" && metadata.is_demo === true);
}

// --- 基础订单操作 ---

/**
 * 创建订单
 */
export async function createOrderAction(
  listingId: string,
  requirements: string,
  selectedOptions: Array<{ label: string; price: number; priceCents?: number }> = [],
  selectedPackage?: { tier: "basic" | "standard" | "premium"; packageDetails?: Record<string, unknown> }
): Promise<CreateOrderResult> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "请先登录后再下单", code: "UNAUTHORIZED" };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, type: true, price: true, priceCents: true, options: true, metadata: true },
    });

    if (!listing) {
      return { success: false, error: "服务不存在或已下架", code: "NOT_FOUND" };
    }

    if (isDemoListing(listing) && process.env.DEMO_DISABLE_ORDER_CREATION === "1") {
      return {
        success: false,
        code: "DEMO_DISABLED",
        error: "演示模式：订单不会真正创建",
        details: "当前环境已关闭订单创建。",
      };
    }

    const serverOptionsRaw = listing.options as any;
    const serverOptions: Array<{ label: string; price: number; priceCents?: number }> = Array.isArray(
      serverOptionsRaw
    )
      ? serverOptionsRaw
      : [];

    const validated = selectedOptions.filter((so) => {
      const match = serverOptions.find((o) => {
        if (typeof o.priceCents === "number" && o.priceCents > 0 && typeof (so as any).priceCents === "number") {
          return o.label === (so as any).label && o.priceCents === (so as any).priceCents;
        }
        return o.label === so.label && o.price === so.price;
      });
      return Boolean(match);
    });

    const addOnTotalCents = validated.reduce((acc, o) => {
      const cents = typeof o.priceCents === "number" && o.priceCents > 0 ? o.priceCents : Math.round(o.price * 100);
      return acc + cents;
    }, 0);

    const listingPriceCents = (listing as any).priceCents as number | null | undefined;
    let totalCents = 0;
    let total = 0;

    if (typeof listingPriceCents === "number" && listingPriceCents > 0) {
      totalCents = listingPriceCents + addOnTotalCents;
      total = totalCents / 100;
    } else {
      total = listing.price + addOnTotalCents / 100;
      totalCents = Math.round(total * 100);
    }

    const metadata = {
      requirements,
      selected_options: validated,
      selected_package: selectedPackage ? JSON.parse(JSON.stringify(selectedPackage)) : null,
      is_demo: isDemoListing(listing) ? true : undefined,
    } as any;

    const fulfillmentType = listing.type === "ASSET" ? "INSTANT_DOWNLOAD" : "MANUAL_DELIVERY";

    const order = await prisma.order.create({
      data: {
        buyerId: userId,
        listingId: listing.id,
        fulfillmentType,
        amount: total,
        amountCents: totalCents,
        // 下单即视为资金已托管完毕（Technical Preview 阶段）
        // 为避免“双状态机不同步”，宏观订单状态也直接进入 paid
        status: OrderStatus.paid,
        deliveryStatus: DeliveryStatus.PAID,
        escrowStatus: EscrowStatus.ESCROWED,
        metadata,
      },
      include: {
        buyer: true,
        listing: true,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/");

    return { success: true, data: serializePrisma(order) };
  } catch (e) {
    console.error("CREATE_ORDER_ERROR:", e);
    return { success: false, error: "下单失败", code: "UNKNOWN" };
  }
}

/**
 * 支付订单 (简化模拟)
 */
export async function payOrderAction(orderId: string): Promise<ActionResult<OrderWithBuyerListing>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          include: {
            freelancerProfile: true,
          },
        },
      },
    });
    if (!order) throw new Error("订单不存在");

    const fromStatus = order.deliveryStatus;
    const toStatus = DeliveryStatus.PAID;
    const fromEscrow = order.escrowStatus;
    const toEscrow = EscrowStatus.ESCROWED;

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.paid,
          deliveryStatus: toStatus,
          escrowStatus: toEscrow,
        },
        include: { buyer: true, listing: true },
      });

      // 写入支付成功审计日志 (ActorType: SYSTEM)
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: ActorType.SYSTEM,
          action: OrderActionType.MARK_PAID,
          fromStatus,
          toStatus,
          fromEscrow,
          toEscrow,
          comment: "系统确认收款，资金已安全托管，订单进入待交付状态",
        },
      });

      return u;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "支付失败" };
  }
}

/**
 * 7. 发起争议 (买家/卖家/协作者/管理员均可调用)
 * 允许在交付后、审计中或要求修改时发起，冻结订单进入争议态
 */
export async function initiateDispute(
  orderId: string,
  reason: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        status: true,
        deliveryStatus: true,
        escrowStatus: true,
        assignedFreelancerId: true,
        listing: {
          select: {
            freelancerProfile: { select: { userId: true } },
          },
        },
      },
    });

    if (!order) throw new Error("订单不存在");

    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === "admin";
    const isBuyer = order.buyerId === userId;
    const isPrimarySeller = order.listing?.freelancerProfile?.userId === userId;
    const isAssignedCollaborator = order.assignedFreelancerId === userId;
    const isPart = isBuyer || isPrimarySeller || isAssignedCollaborator || isAdmin;

    if (!isPart) throw new Error("无权限：您不属于该订单的参与方");

    // 状态校验：只有在已支付且未完结的状态下可以发起争议
    if (order.status !== OrderStatus.paid) {
      throw new Error(`当前订单宏观状态 (${order.status}) 不允许发起争议`);
    }

    const fromStatus = order.deliveryStatus;
    const toStatus = DeliveryStatus.DISPUTED;
    const toOrderStatus = OrderStatus.disputed;

    const result = await prisma.$transaction(async (tx) => {
      // A. 更新订单状态为争议
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: toOrderStatus,
          deliveryStatus: toStatus,
        },
      });

      // B. 记录审计日志
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: isAdmin ? ActorType.ADMIN : ActorType.USER,
          action: OrderActionType.INITIATE_DISPUTE,
          fromStatus,
          toStatus,
          comment: reason || "参与方发起了争议，等待人工介入处理",
          metadata: {
            initiatedBy: userId,
            role: isAdmin ? "admin" : isBuyer ? "buyer" : "seller",
            reason,
          },
        },
      });

      // C. 通知其他参与方 (简单实现：通知买家和主卖家)
      const notifyUsers = [order.buyerId, order.listing?.freelancerProfile?.userId].filter(
        (id) => id && id !== userId
      );

      for (const targetUserId of notifyUsers) {
        if (!targetUserId) continue;
        await (tx as any).notification.create({
          data: {
            userId: targetUserId,
            type: "ORDER_UPDATE",
            title: "订单进入争议状态",
            content: `订单 ${orderId} 已由对方发起争议，理由：${reason.slice(0, 50)}${reason.length > 50 ? "..." : ""}。请等待平台处理。`,
            link: `/dashboard/orders/${encodeURIComponent(orderId)}#timeline`,
            isRead: false,
          },
        });
      }

      return updated;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    
    // 统一返回 A 语义：already_settled
    if ((result as any)?.alreadySettled) {
      return { 
        success: true, 
        data: { 
          status: "already_settled", 
          ...(result as any).updated 
        } 
      };
    }

    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "发起争议失败" };
  }
}

/**
 * 8. 取消订单 (买家/管理员调用)
 * 仅允许在卖家提交交付前取消。
 * 行为：status -> cancelled, deliveryStatus -> CLOSED, escrowStatus -> REFUNDED (模拟)
 */
export async function cancelOrder(
  orderId: string,
  reason: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        status: true,
        deliveryStatus: true,
        escrowStatus: true,
      },
    });

    if (!order) throw new Error("订单不存在");

    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === "admin";
    const isBuyer = order.buyerId === userId;

    if (!isBuyer && !isAdmin) throw new Error("无权限：仅买家或管理员可取消订单");

    // 状态校验：只有在已支付但未交付、未完结的状态下可以取消
    // 如果已经进入 AUDITING 或 DELIVERED，应走争议流程
    if (order.deliveryStatus !== DeliveryStatus.PAID) {
      throw new Error("当前状态不允许直接取消。如果卖家已交付，请发起争议。");
    }

    const fromStatus = order.deliveryStatus;
    const toStatus = DeliveryStatus.CLOSED;
    const fromEscrow = order.escrowStatus;
    const toEscrow = EscrowStatus.REFUNDED;

    const result = await prisma.$transaction(async (tx) => {
      // A. 更新订单状态
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.cancelled,
          deliveryStatus: toStatus,
          escrowStatus: toEscrow,
        },
      });

      // B. 记录审计日志
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: isAdmin ? ActorType.ADMIN : ActorType.USER,
          action: OrderActionType.CANCEL_ORDER,
          fromStatus,
          toStatus,
          fromEscrow,
          toEscrow,
          comment: reason || "买家主动取消了订单，资金已原路退回",
          metadata: {
            cancelledBy: userId,
            role: isAdmin ? "admin" : "buyer",
            reason,
          },
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/orders");
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "取消订单失败" };
  }
}

/**
 * 9. 管理员手动介入记录
 * 允许管理员在不改变订单状态的情况下，在时间线上增加一条人工审计/说明记录
 */
export async function adminInterventionAction(
  orderId: string,
  comment: string,
  metadata?: any
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = session?.user?.id;

    if (userRole !== "admin" || !userId) {
      throw new Error("无权限：仅系统管理员可执行此操作");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("订单不存在");

    const result = await prisma.orderEventLog.create({
      data: {
        orderId,
        userId,
        actorType: ActorType.ADMIN,
        action: OrderActionType.ADMIN_INTERVENTION,
        fromStatus: order.deliveryStatus,
        toStatus: order.deliveryStatus,
        comment,
        metadata: metadata || { manual_intervention: true },
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "介入记录失败" };
  }
}

// --- 交付验收状态机 (核心标准 API) ---

/**
 * 1. 提交交付 (卖家调用)
 */
export async function submitDelivery(
  orderId: string, 
  fileUrls: string[] = [],
  notes?: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = (await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        buyerId: true,
        isSubOrder: true,
        isQAEnabled: true,
        deliveryStatus: true,
        assignedFreelancerId: true,
        listing: {
          select: {
            freelancerProfile: {
              select: { userId: true },
            },
          },
        },
        parentOrder: {
          select: {
            id: true,
            listing: {
              select: {
                freelancerProfile: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    })) as any;

    if (!order) throw new Error("订单不存在");

    const role = (session?.user as any)?.role as string | null | undefined;
    const isAdmin = role === "admin";

    // 权限约束：
    // - 非子单：仅主卖家（listing.freelancerProfile.userId）可提交交付
    // - 子单：仅被指派的协作者（assignedFreelancerId）可提交交付
    //   （不允许主接单人代交付，避免责任归属混乱）
    const isPrimarySeller = order.listing?.freelancerProfile?.userId === userId;
    const isAssignedCollaborator = order.assignedFreelancerId === userId;

    const canSubmitDelivery = order.isSubOrder === true ? isAssignedCollaborator : isPrimarySeller;

    if (!isAdmin && !canSubmitDelivery) {
      throw new Error(order.isSubOrder === true ? "无权限：仅被指派的协作者可提交子任务交付" : "无权限：仅主卖家可提交交付");
    }

    // 状态校验：只有在 PAID 或 CHANGES_REQUESTED 状态下可以交付
    const allowedStatus: DeliveryStatus[] = [DeliveryStatus.PAID, DeliveryStatus.CHANGES_REQUESTED];
    if (!allowedStatus.includes(order.deliveryStatus)) {
      throw new Error(`当前订单交付状态 (${order.deliveryStatus}) 不允许提交交付`);
    }

    const fromStatus = order.deliveryStatus;
    const toStatus = (order as any).isQAEnabled ? DeliveryStatus.AUDITING : DeliveryStatus.DELIVERED;

    const result = await prisma.$transaction(async (tx) => {
      // A. 创建交付记录 (兼容旧 schema 的单文件字段)
      await tx.delivery.create({
        data: {
          orderId,
          content: notes || "卖家提交了交付物",
          fileUrl: fileUrls[0] || null,
          status: "delivered",
        },
      });

      const qaSubmittedAt = order.isQAEnabled ? new Date() : null;
      const qaDeadlineAt = order.isQAEnabled ? new Date(Date.now() + 48 * 60 * 60 * 1000) : null;

      // B. 更新订单交付状态
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.delivered, // 同步更新旧的 OrderStatus
          deliveryStatus: toStatus,
          ...(toStatus === DeliveryStatus.AUDITING
            ? {
                qaSubmittedAt: qaSubmittedAt ?? undefined,
                qaDeadlineAt: qaDeadlineAt ?? undefined,
              }
            : {}),
        },
      });

      // C. 写入严密审计日志
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          action: OrderActionType.SUBMIT_DELIVERY,
          fromStatus,
          toStatus,
          comment:
            order.isSubOrder === true
              ? notes || "已向主接单人提交内部交付物"
              : toStatus === DeliveryStatus.AUDITING
                ? notes || "提交交付物，进入专家审计流程"
                : notes || "卖家提交了交付物",
          metadata: {
            fileUrls,
            internalDelivery: order.isSubOrder === true,
            qa: {
              isQAEnabled: Boolean(order.isQAEnabled),
              flow: order.isQAEnabled ? "SUBMIT_DELIVERY_TO_AUDITING" : "SUBMIT_DELIVERY_TO_DELIVERED",
              qaSubmittedAt: qaSubmittedAt ? qaSubmittedAt.toISOString() : null,
              qaDeadlineAt: qaDeadlineAt ? qaDeadlineAt.toISOString() : null,
            },
          },
        },
      });

      // If order enters AUDITING, write a real audit log to mark QA started (ActorType: SYSTEM)
      if (toStatus === DeliveryStatus.AUDITING) {
        await tx.orderEventLog.create({
          data: {
            orderId,
            userId,
            actorType: ActorType.SYSTEM,
            action: OrderActionType.QA_STARTED as OrderActionType,
            fromStatus,
            toStatus: DeliveryStatus.AUDITING,
            comment: "系统已接收交付物，进入专家审计流程（预计 48h 内出具报告）",
            metadata: {
              reason: "QA_STARTED",
              systemTriggered: true,
              qaSubmittedAt: qaSubmittedAt ? qaSubmittedAt.toISOString() : null,
              qaDeadlineAt: qaDeadlineAt ? qaDeadlineAt.toISOString() : null,
            },
          },
        });
      }

      // D. 站内通知
      // - 子订单：仅通知父订单 seller（主接单人）进行内部验收
      // - 非子订单：通知买家验收 / 进入专家审查
      if (order.isSubOrder === true) {
        const parentSellerUserId = order?.parentOrder?.listing?.freelancerProfile?.userId as string | undefined;
        if (parentSellerUserId) {
          await (tx as any).notification.create({
            data: {
              userId: parentSellerUserId,
              type: "ORDER_UPDATE" as any,
              title: "内部交付物已提交 · 等待您验收",
              content: `子任务订单 ${updated.id} 的协作者已提交内部交付物，请前往验收（防越级：不会推送给最终买家）。`,
              link: `/dashboard/orders/${encodeURIComponent(updated.id)}#delivery-panel`,
              isRead: false,
            },
          });
        }
      } else {
        await (tx as any).notification.create({
          data: {
            userId: updated.buyerId,
            type: "ORDER_UPDATE" as any,
            title: order.isQAEnabled ? "交付物已提交 · 等待专家审查" : "卖家已提交交付物",
            content: order.isQAEnabled
              ? `您的订单 ${updated.id} 交付物已提交，正在进入专家审查流程，请稍候。`
              : `您的订单 ${updated.id} 卖家已提交交付物，请及时验收。`,
            link: `/dashboard/orders/${encodeURIComponent(updated.id)}#delivery-panel`,
            isRead: false,
          },
        });
      }

      return updated;
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard/workbench");
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "交付提交失败" };
  }
}

/**
 * 2. 要求修改 (买家调用)
 */
export async function requestChanges(
  orderId: string, 
  feedback: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        parentOrder: {
          select: {
            id: true,
            listing: {
              select: {
                freelancerProfile: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) throw new Error("订单不存在");
    if (order.buyerId !== userId) throw new Error("无权限：仅买家可要求修改");

    // 状态校验：只有在 DELIVERED 状态下可以要求修改
    if (order.deliveryStatus !== DeliveryStatus.DELIVERED) {
      throw new Error("当前订单状态不允许要求修改");
    }

    const fromStatus = order.deliveryStatus;
    const toStatus = DeliveryStatus.CHANGES_REQUESTED;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryStatus: toStatus,
          metadata: {
            ...(((order.metadata as any) || {}) as any),
            last_feedback: feedback,
            feedback_at: new Date().toISOString(),
          },
        },
      });

      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          action: OrderActionType.REQUEST_CHANGES,
          fromStatus,
          toStatus,
          comment: feedback,
        },
      });

      // 站内通知：提醒卖家处理修改意见
      const orderWithSeller = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          buyerId: true,
          listing: {
            select: {
              freelancerProfile: {
                select: { userId: true },
              },
            },
          },
        },
      });

      const sellerUserId = orderWithSeller?.listing?.freelancerProfile?.userId;
      if (sellerUserId) {
        await (tx as any).notification.create({
          data: {
            userId: sellerUserId,
            type: "ORDER_UPDATE" as any,
            title: "买家要求修改",
            content: `订单 ${orderId} 买家提交了修改意见，请尽快重新交付。`,
            link: `/dashboard/orders/${encodeURIComponent(orderId)}#delivery-panel`,
            isRead: false,
          },
        });
      }

      return updated;
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "申请修改失败" };
  }
}

/**
 * 3. 验收通过 (买家调用) - 自动释放资金版本
 */
export async function acceptDelivery(orderId: string): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = (await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          select: {
            freelancerProfile: {
              select: { userId: true },
            },
          },
        },
        parentOrder: {
          select: {
            id: true,
            listing: {
              select: {
                freelancerProfile: {
                  select: { userId: true },
                },
              },
            },
          },
        },
      },
    })) as any;

    if (!order) throw new Error("订单不存在");

    // 权限校验：
    // - 子订单：验收人必须是父订单的卖家（主接单人）
    // - 普通订单：验收人必须是买家
    if (order.isSubOrder === true) {
      const parentSellerId = order.parentOrder?.listing?.freelancerProfile?.userId as string | undefined;
      if (!parentSellerId) throw new Error("子订单缺少父订单卖家信息");
      if (parentSellerId !== userId) throw new Error("无权限：仅主接单人可验收子任务交付物");
    } else {
      if (order.buyerId !== userId) throw new Error("无权限：仅买家可验收");
    }

    if (order.deliveryStatus !== DeliveryStatus.DELIVERED) {
      throw new Error("当前订单尚未交付，无法验收");
    }

    const fromStatus = order.deliveryStatus;
    const toStatus = DeliveryStatus.CLOSED; // 验收即完结
    const fromEscrow = order.escrowStatus;
    const toEscrow = EscrowStatus.RELEASED; // 验收即释放

    const result = await prisma.$transaction(async (tx) => {
      // 先标记订单交付与托管状态（结算会在 executeOrderSettlement 内部固化 completed + settledAt 等）
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          deliveryStatus: toStatus,
          escrowStatus: toEscrow,
        },
      });

      // 执行分账与入账（必须在同一事务内）
      // 注意：executeOrderSettlement 会将订单 status 固化为 completed，并写入 settledAt / qaFeeCents
      // Phase 3: 子订单一旦被主接单人内部验收通过，将立即触发子单独立结算（协作者拿钱走人，风险由主接单人兜底）
      const settlement = await executeOrderSettlement(tx, order);

      // 如果已经结算过：幂等返回 200 语义，避免重复加钱/重复释放动作
      if (settlement.alreadySettled) {
        return { updated, settlement, alreadySettled: true };
      }

      // 记录验收日志 (ActorType: USER)
      const acceptComment =
        order.isSubOrder === true ? "主接单人内部验收通过（子任务结算）" : "买家验收通过";

      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: ActorType.USER,
          action: OrderActionType.ACCEPT_DELIVERY,
          fromStatus,
          toStatus,
          comment: acceptComment,
          metadata: {
            ...(order.isSubOrder === true
              ? { acceptScope: "INTERNAL_SUB_ORDER", acceptedBy: "PRIMARY_SELLER" }
              : { acceptScope: "BUYER_FINAL", acceptedBy: "BUYER" }),
          },
        },
      });

      // 记录资金释放日志 (ActorType: SYSTEM)
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: ActorType.SYSTEM,
          action: OrderActionType.RELEASE_FUNDS,
          fromStatus,
          toStatus,
          fromEscrow,
          toEscrow,
          comment: "验收通过，系统自动释放资金",
          metadata: {
            trigger: "ACCEPT_DELIVERY_AUTO_SETTLEMENT",
          },
        },
      });

      // 站内通知：按订单类型分流（防越级）
      // - 普通单：通知卖家 + 买家
      // - 子单：通知协作者（被指派 freelancer）+ 主接单人（子单 buyer），不通知最终买家

      if (order.isSubOrder === true) {
        // A) 通知协作者：你的子任务已被主接单人验收，并已完成结算
        const collaboratorUserId = order.assignedFreelancerId as string | undefined;
        if (collaboratorUserId) {
          await (tx as any).notification.create({
            data: {
              userId: collaboratorUserId,
              type: "ORDER_UPDATE" as any,
              title: "子任务已验收 · 已结算",
              content: `您的子任务订单 ${orderId} 已被主接单人内部验收通过，并已完成结算。`,
              link: `/dashboard/orders/${encodeURIComponent(orderId)}#action-bar`,
              isRead: false,
            },
          });
        }

        // B) 通知主接单人（子单 buyer）：内部验收完成
        await (tx as any).notification.create({
          data: {
            userId: updated.buyerId,
            type: "ORDER_UPDATE" as any,
            title: "子任务验收完成 · 已结算",
            content: `您已完成子任务订单 ${orderId} 的内部验收，系统已执行子任务结算。`,
            link: `/dashboard/orders/${encodeURIComponent(orderId)}#action-bar`,
            isRead: false,
          },
        });
      } else {
        // 1) 通知卖家：买家已验收，资金已释放（自动）
        const orderWithSeller = await tx.order.findUnique({
          where: { id: orderId },
          select: {
            listing: {
              select: {
                freelancerProfile: { select: { userId: true } },
              },
            },
          },
        });

        const sellerUserId = orderWithSeller?.listing?.freelancerProfile?.userId;
        if (sellerUserId) {
          await (tx as any).notification.create({
            data: {
              userId: sellerUserId,
              type: "ORDER_UPDATE" as any,
              title: "订单已验收 · 资金已释放",
              content: `订单 ${orderId} 买家已确认验收，系统已释放托管资金。`,
              link: `/dashboard/orders/${encodeURIComponent(orderId)}#action-bar`,
              isRead: false,
            },
          });
        }

        // 2) 通知买家：验收成功（确认信息）
        await (tx as any).notification.create({
          data: {
            userId: updated.buyerId,
            type: "ORDER_UPDATE" as any,
            title: "验收成功 · 订单已完成",
            content: `您已验收通过订单 ${orderId}，资金已释放，订单进入已完成。`,
            link: `/dashboard/orders/${encodeURIComponent(orderId)}#action-bar`,
            isRead: false,
          },
        });
      }

      return updated;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "验收失败" };
  }
}

/**
 * 4. 释放资金 (管理员调用)
 */
export async function releaseEscrowFunds(
  orderId: string,
  notes?: string
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    const userId = session?.user?.id;

    if (userRole !== "admin") {
      throw new Error("无权限：仅系统管理员可手动释放资金");
    }
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("订单不存在");
    
    // 严格校验：必须已验收通过，且资金还在托管中
    if (order.deliveryStatus !== DeliveryStatus.ACCEPTED) {
      throw new Error("订单尚未完成验收，无法释放资金");
    }

    if (order.escrowStatus !== EscrowStatus.ESCROWED) {
      throw new Error(`资金状态异常 (${order.escrowStatus})，无法释放`);
    }

    const fromEscrow = order.escrowStatus;
    const toEscrow = EscrowStatus.RELEASED;

    const result = await prisma.$transaction(async (tx) => {
      // A. 更新订单资金状态与最终交付状态
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          escrowStatus: toEscrow,
          deliveryStatus: DeliveryStatus.CLOSED, // 释放资金后，订单彻底完结
        },
      });

      // B. 写入包含资金流转信息的审计日志 (ActorType: ADMIN)
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: ActorType.ADMIN,
          action: OrderActionType.RELEASE_FUNDS,
          fromStatus: order.deliveryStatus,
          toStatus: updated.deliveryStatus,
          fromEscrow,
          toEscrow,
          comment: notes || "管理员手动释放资金",
        },
      });

      // C. 站内通知：双方都发 (Option C)
      // 1) 通知卖家：资金已到账
      const orderWithSeller = await tx.order.findUnique({
        where: { id: orderId },
        select: {
          listing: {
            select: {
              freelancerProfile: { select: { userId: true } },
            },
          },
        },
      });

      const sellerUserId = orderWithSeller?.listing?.freelancerProfile?.userId;
      if (sellerUserId) {
        await (tx as any).notification.create({
          data: {
            userId: sellerUserId,
            type: "ORDER_UPDATE" as any,
            title: "资金已释放",
            content: `订单 ${orderId} 的托管资金已由管理员手动释放，请查收。`,
            link: `/dashboard/orders/${encodeURIComponent(orderId)}#action-bar`,
          },
        });
      }

      // 2) 通知买家：资金已结算
      await (tx as any).notification.create({
        data: {
          userId: updated.buyerId,
          type: "ORDER_UPDATE" as any,
          title: "资金结算完成",
          content: `订单 ${orderId} 的托管资金已结算给卖家，感谢您的支持。`,
          link: `/dashboard/orders/${encodeURIComponent(orderId)}#action-bar`,
        },
      });

      // D. TODO: 真实执行入账逻辑 (调用 Transaction 等逻辑)

      return updated;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/admin");
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "资金释放失败" };
  }
}

/**
 * 5. 补偿释放资金 (针对历史 ACCEPTED 但未 RELEASED 的单子)
 */
export async function compensateReleaseFunds(orderId: string): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const isAdmin = (session.user as any)?.role === "admin";

    const orderWithSeller = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        listing: {
          select: { freelancerProfile: { select: { userId: true } } }
        }
      }
    });

    if (!orderWithSeller) throw new Error("订单不存在");

    const isBuyer = orderWithSeller.buyerId === userId;
    const isSeller = orderWithSeller.listing.freelancerProfile.userId === userId;

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new Error("无权限");
    }

    if (
      orderWithSeller.deliveryStatus !== DeliveryStatus.ACCEPTED ||
      orderWithSeller.escrowStatus !== EscrowStatus.ESCROWED
    ) {
      throw new Error("订单状态无需补偿释放");
    }

    const fromEscrow = orderWithSeller.escrowStatus;
    const toEscrow = EscrowStatus.RELEASED;
    const toStatus = DeliveryStatus.CLOSED;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.order.update({
        where: { id: orderId },
        data: { 
          escrowStatus: toEscrow,
          deliveryStatus: toStatus,
          status: OrderStatus.completed
        },
      });

      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          actorType: ActorType.SYSTEM,
          action: OrderActionType.RELEASE_FUNDS,
          fromStatus: orderWithSeller.deliveryStatus,
          toStatus: updated.deliveryStatus,
          fromEscrow,
          toEscrow,
          comment: "同步资金状态：系统自动补偿释放",
          metadata: {
            trigger: "COMPENSATE_RELEASE_FUNDS",
          },
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "补偿释放失败" };
  }
}

/**
 * 6. 提交 QA 专家审查报告 (管理员调用)
 * Phase 1: Expert QA Review 核心逻辑
 */
export async function submitQAReport(
  orderId: string,
  reportContent: string,
  outcome: QAOutcome
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role;

    // 权限校验：MVP 阶段仅管理员可提交（平台管理员/官方 QA）
    if (!userId || userRole !== "admin") {
      throw new Error("无权限：仅系统管理员/官方QA可提交审查报告");
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) throw new Error("订单不存在");

    // 状态校验：订单必须处于 AUDITING 状态
    if (order.deliveryStatus !== DeliveryStatus.AUDITING) {
      throw new Error(`当前订单状态 (${order.deliveryStatus}) 不在专家审查中，无法提交报告`);
    }

    // 硬约束：deliveryStatus 子状态机仅在 status === paid 时允许推进
    if (order.status !== OrderStatus.paid) {
      throw new Error(`订单宏观状态 (${order.status}) 非 paid，禁止提交 QA 报告或推进交付状态`);
    }

    const fromStatus = order.deliveryStatus;

    const result = await prisma.$transaction(async (tx) => {
      const submittedAt = new Date();

      // 基于 QAOutcome 决定命运分支
      let toStatus: DeliveryStatus = DeliveryStatus.DELIVERED;
      let toOrderStatus: OrderStatus = order.status;
      let notificationTitle = "专家审查报告已出具";
      let notificationContent = "您的订单已出具专家审查报告，请前往查阅";
      let logComment: string | undefined = undefined;

      if (outcome === QAOutcome.PASS) {
        toStatus = DeliveryStatus.DELIVERED;
        notificationTitle = "专家审查通过 · 自动结算";
        notificationContent = "专家已确认交付质量，系统将自动执行结算并释放资金（账本幂等）。";
        logComment = "专家审查通过";
      } else if (outcome === QAOutcome.NEED_CHANGES) {
        toStatus = DeliveryStatus.CHANGES_REQUESTED;
        notificationTitle = "专家建议修改交付物";
        notificationContent = "专家认为交付物需要进一步完善，请查看修改建议并等待卖家重新交付。";
        logComment = "专家建议修改";
      } else if (outcome === QAOutcome.FAIL) {
        // FAIL：升级到宏观争议态，封死结算入口
        toStatus = DeliveryStatus.DISPUTED;
        toOrderStatus = OrderStatus.disputed;
        notificationTitle = "专家审查未通过 · 订单进入争议";
        notificationContent = "专家认为交付物不符合要求，订单已自动转入争议处理流程。";
        logComment = "专家审查未通过，进入争议";
      } else {
        throw new Error("无效的 QAOutcome");
      }

      // A. 写入订单：报告 + outcome + 完成时间 + 状态推进
      const updated = await tx.order.update({
        where: { id: orderId },
        data: {
          qaReport: reportContent,
          qaOutcome: outcome,
          qaAuditorId: userId,
          qaCompletedAt: submittedAt,
          deliveryStatus: toStatus,
          status: toOrderStatus,
          // 将专家意见同步进 metadata（便于后续 UI/查询，不强依赖 qaReport 文本解析）
          metadata: {
            ...(((order.metadata as any) || {}) as any),
            qa: {
              ...((((order.metadata as any) || {}) as any)?.qa || {}),
              outcome,
              reportContent,
              completedAt: submittedAt.toISOString(),
            },
          },
        },
      });

      // B. 审计日志：SUBMIT_QA_REPORT
      await tx.orderEventLog.create({
        data: {
          orderId,
          userId,
          action: OrderActionType.SUBMIT_QA_REPORT,
          fromStatus,
          toStatus,
          comment: logComment,
          metadata: {
            reportContent,
            qaOutcome: outcome,
            qaCompletedAt: submittedAt.toISOString(),
          },
        },
      });

      // C. PASS：自动结算（事务内）
      if (outcome === QAOutcome.PASS) {
        const latestOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: {
            listing: {
              select: {
                freelancerProfile: { select: { userId: true } },
              },
            },
          },
        });

        if (!latestOrder) throw new Error("结算异常：订单不存在");

        await executeOrderSettlement(tx, latestOrder);

        // 结算发生后，补一条资金释放审计日志（保持时间轴语义完整）
        await tx.orderEventLog.create({
          data: {
            orderId,
            userId,
            actorType: ActorType.SYSTEM,
            action: OrderActionType.RELEASE_FUNDS,
            fromEscrow: order.escrowStatus,
            toEscrow: EscrowStatus.RELEASED,
            comment: "专家审查通过，系统自动结算并释放资金",
            metadata: {
              trigger: "QA_PASS_AUTO_SETTLEMENT",
            },
          },
        });

        // 注意：executeOrderSettlement 当前不会改 escrowStatus，这里将资金态同步为 RELEASED（逻辑释放）
        await tx.order.update({
          where: { id: orderId },
          data: {
            escrowStatus: EscrowStatus.RELEASED,
            deliveryStatus: DeliveryStatus.CLOSED,
          },
        });

        notificationTitle = "专家审查通过 · 订单已完成";
        notificationContent = "专家已确认交付质量，订单已自动完成结算并释放资金。";
      }

      // D. 通知买家
      await (tx as any).notification.create({
        data: {
          userId: updated.buyerId,
          type: "ORDER_UPDATE" as any,
          title: notificationTitle,
          content: notificationContent,
          link: `/dashboard/orders/${encodeURIComponent(orderId)}#delivery-panel`,
          isRead: false,
        },
      });

      return updated;
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "提交 QA 报告失败" };
  }
}

/**
 * 更新订单需求
 */
/**
 * Phase 2: 创建子订单 (任务拆包)
 *
 * 风控：
 * - budgetCents > 0
 * - budgetCents <= parentOrder.amountCents * 0.8
 *
 * 身份转换：父订单 Seller (主接单人) -> 子订单 Buyer (发包方)
 */
export async function createSubOrder(
  parentOrderId: string,
  title: string,
  description: string,
  budgetCents: number
): Promise<ActionResult<any>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    if (!Number.isFinite(budgetCents)) throw new Error("发包金额不合法");
    if (budgetCents <= 0) throw new Error("发包金额必须大于 0");

    const parentOrder = await prisma.order.findUnique({
      where: { id: parentOrderId },
      include: {
        listing: {
          select: {
            id: true,
            freelancerProfile: { select: { userId: true } },
          },
        },
      },
    });

    if (!parentOrder) throw new Error("父订单不存在");

    // 仅父订单卖家（主接单人）可发包拆分
    const parentSellerId = (parentOrder as any)?.listing?.freelancerProfile?.userId as string | undefined;
    if (!parentSellerId) throw new Error("父订单缺少卖家信息");
    if (parentSellerId !== userId) throw new Error("无权限：只有主接单人可拆分子任务");

    // 父订单状态允许拆分：paid 且未 closed
    if (parentOrder.status !== OrderStatus.paid || parentOrder.deliveryStatus === DeliveryStatus.CLOSED) {
      throw new Error("当前订单状态不允许拆分子任务");
    }

    // 风控：最多拆分主订单总额的 80%
    const maxCents = Math.floor((parentOrder.amountCents || 0) * 0.8);
    if (budgetCents > maxCents) {
      throw new Error("发包金额不能超过主订单总额的 80%，请保留足够的履约保证金。");
    }

    const safeTitle = title?.trim();
    if (!safeTitle) throw new Error("子任务标题不能为空");
    const safeDescription = description?.trim();
    if (!safeDescription) throw new Error("需求详细描述不能为空");

    const result = await prisma.$transaction(async (tx) => {
      const subOrder = await tx.order.create({
        data: {
          parentId: parentOrderId,
          isSubOrder: true,
          subOrderType: SubOrderType.FIXED_PRICE,

          // 身份转换：父 Seller -> 子 Buyer
          buyerId: parentSellerId,

          // 暂沿用父订单 listing 作为占位；后续可演进为“协作任务池/内部 listing”
          listingId: parentOrder.listingId,

          amount: budgetCents / 100,
          amountCents: budgetCents,

          // 子任务在当前 Technical Preview 资金模拟模式下，创建即视为已托管
          // 为避免“双状态机不同步”，这里也保持宏观 status 与 deliveryStatus 对齐
          status: OrderStatus.paid,
          deliveryStatus: DeliveryStatus.PAID,
          escrowStatus: EscrowStatus.ESCROWED,

          metadata: {
            ...(typeof parentOrder.metadata === "object" && parentOrder.metadata ? (parentOrder.metadata as any) : {}),
            subOrder: {
              title: safeTitle,
              description: safeDescription,
              budgetCents,
            },
          } as any,
        },
      });

      // 记录主订单日志（Phase 2: 发包拆分）
      await tx.orderEventLog.create({
        data: {
          orderId: parentOrderId,
          userId,
          actorType: ActorType.USER,
          action: OrderActionType.CREATE_SUB_ORDER,
          comment: `拆分子任务：${safeTitle}`,
          metadata: {
            action: "CREATE_SUB_ORDER",
            subOrderId: subOrder.id,
            title: safeTitle,
            budgetCents,
          },
        },
      });

      return subOrder;
    });

    revalidatePath(`/dashboard/orders/${parentOrderId}`);
    return { success: true, data: serializePrisma(result) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "创建子任务失败" };
  }
}

/**
 * 更新订单需求
 */
export async function updateOrderRequirements(
  orderId: string,
  requirements: string
): Promise<ActionResult<OrderWithBuyerListing>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true },
    });

    if (!order) return { success: false, error: "订单不存在" };
    if (order.buyerId !== userId) return { success: false, error: "无权限" };

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        metadata: {
          ...((await prisma.order.findUnique({ where: { id: orderId } }).then((o: any) => (o?.metadata as any) || {})) as any),
          requirements,
          requirements_updated_at: new Date().toISOString(),
        },
      },
      include: {
        buyer: true,
        listing: true,
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "更新需求失败" };
  }
}
