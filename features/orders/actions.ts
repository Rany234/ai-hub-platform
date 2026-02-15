"use server";

import { revalidatePath } from "next/cache";

import { Prisma } from "@prisma/client";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/utils";
import type { ActionResult } from "@/types/actions";

export type OrderWithBuyerListing = Prisma.OrderGetPayload<{
  include: { buyer: true; listing: true };
}>;

export type OrderWithBuyerListingDeliveries = Prisma.OrderGetPayload<{
  include: { buyer: true; listing: true; deliveries: true };
}>;

export type CreateOrderResult =
  | { success: true; data: OrderWithBuyerListing }
  | { success: false; error: string; code?: "UNAUTHORIZED" | "NOT_FOUND" | "UNKNOWN" };

export async function createOrderAction(
  listingId: string,
  requirements: string,
  selectedOptions: Array<{ label: string; price: number }> = [],
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
      select: { id: true, price: true, options: true },
    });

    if (!listing) {
      return { success: false, error: "服务不存在或已下架", code: "NOT_FOUND" };
    }

    const serverOptions = (listing.options as Array<{ label: string; price: number }> | null) ?? [];

    const validated = selectedOptions.filter((so) => {
      const match = serverOptions.find((o) => o.label === so.label && o.price === so.price);
      return Boolean(match);
    });

    const addOnTotal = validated.reduce((acc, o) => acc + o.price, 0);
    const total = listing.price + addOnTotal;

    const metadata = {
      requirements,
      selected_options: validated,
      selected_package: selectedPackage ? JSON.parse(JSON.stringify(selectedPackage)) : null,
    } as any;

    const order = await prisma.order.create({
      data: {
        buyerId: userId,
        listingId: listing.id,
        amount: total,
        status: "pending",
        escrowStatus: "held",
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
    return { success: false, error: "下单失败，请稍后重试", code: "UNKNOWN" };
  }
}

export async function payOrderAction(orderId: string): Promise<ActionResult<OrderWithBuyerListing>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        escrowStatus: "held",
      },
      include: {
        buyer: true,
        listing: true,
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "支付失败",
    };
  }
}

export async function createDeliveryAction(
  orderId: string,
  content: string,
  input?: {
    fileKey: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  } | null
): Promise<ActionResult<OrderWithBuyerListingDeliveries>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { listing: { select: { creatorId: true } } },
    });

    if (!order) return { success: false, error: "订单不存在" };

    if (order.listing.creatorId !== userId) {
      return { success: false, error: "无权限" };
    }

    if (!['paid', 'delivered'].includes(order.status)) {
      return { success: false, error: "订单状态不正确，无法交付" };
    }

    const deliveryCreate = {
          orderId,
          content,
      fileUrl: null,
          fileKey: input?.fileKey ?? null,
          fileName: input?.fileName ?? null,
          fileSize: input?.fileSize ?? null,
          fileType: input?.fileType ?? null,
          status: "pending",
    } as any;

    const [_, updatedOrder] = await prisma.$transaction([
      prisma.delivery.create({ data: deliveryCreate as any }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: "delivered" },
        include: {
          buyer: true,
          listing: true,
          deliveries: true,
        },
      }),
    ]);

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: serializePrisma(updatedOrder) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "提交交付失败",
    };
  }
}

export async function updateOrderRequirements(orderId: string, requirements: string): Promise<ActionResult<OrderWithBuyerListing>> {
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
          ...(await prisma.order.findUnique({ where: { id: orderId } }).then(o => o?.metadata as any || {})),
          requirements,
          requirements_updated_at: new Date().toISOString(),
        }
      },
      include: {
        buyer: true,
        listing: true,
      }
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "更新需求失败" };
  }
}

export async function approveDeliveryAction(orderId: string): Promise<ActionResult<OrderWithBuyerListing>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true, status: true },
    });

    if (!order) return { success: false, error: "订单不存在" };

    if (order.buyerId !== userId) {
      return { success: false, error: "无权限" };
    }

    if (order.status !== "delivered") {
      return { success: false, error: "订单状态不正确，无法确认收货" };
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "completed",
        escrowStatus: "released",
      },
      include: {
        buyer: true,
        listing: true,
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "确认收货失败",
    };
  }
}

export async function completeOrderAction(orderId: string): Promise<ActionResult<OrderWithBuyerListing>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true, status: true, paymentMethod: true, amount: true },
    });

    if (!order) return { success: false, error: "订单不存在" };
    if (order.buyerId !== userId) return { success: false, error: "无权限" };
    if (order.status !== "delivered") {
      return { success: false, error: "订单状态不正确，当前无法验收" };
    }

    // 模拟资金划转逻辑
    if (order.paymentMethod === "OFFLINE") {
      console.log(`[Fund Release] Order ${orderId}: Mock payment detected. Releasing ¥${order.amount} to seller.`);
    } else {
      console.log(`[Fund Release] Order ${orderId}: Releasing ¥${order.amount} via ${order.paymentMethod}.`);
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "completed",
        escrowStatus: "released",
      },
      include: {
        buyer: true,
        listing: true,
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "验收失败",
    };
  }
}

export async function requestChangesAction(orderId: string, feedback: string): Promise<ActionResult<OrderWithBuyerListing>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true, buyerId: true, status: true, metadata: true },
    });

    if (!order) return { success: false, error: "订单不存在" };

    if (order.buyerId !== userId) {
      return { success: false, error: "无权限" };
    }

    if (order.status !== "delivered") {
      return { success: false, error: "订单状态不正确，无法申请修改" };
    }

    const currentMetadata = (order.metadata as Record<string, any>) || {};

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "paid",
        metadata: {
          ...currentMetadata,
          last_feedback: feedback,
          requested_changes_at: new Date().toISOString(),
        },
      },
      include: {
        buyer: true,
        listing: true,
      },
    });

    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");

    return { success: true, data: serializePrisma(updated) };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "申请修改失败",
    };
  }
}
