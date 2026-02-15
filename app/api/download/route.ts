export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

function buildLocalUrl(fileKey: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const name = fileKey.replace(/^local\//, "");
  return `${baseUrl}/uploads/${name}`;
}

/**
 * 本地存储模式（固定）：
 * - 仅支持 local/<filename> fileKey
 * - 返回本地静态 URL
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deliveryId } = (await req.json()) as { deliveryId?: string };
    if (!deliveryId) {
      return NextResponse.json({ error: "Missing deliveryId" }, { status: 400 });
    }

    const delivery = await prisma.delivery.findUnique({
      where: { id: deliveryId },
      include: {
        order: {
          select: {
            buyerId: true,
            status: true,
            listing: {
              select: {
                creatorId: true,
              },
            },
          },
        },
      },
    });

    if (!delivery) {
      return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
    }

    const { order } = delivery;
    const isBuyer = order.buyerId === userId;
    const isSeller = order.listing.creatorId === userId;

    if (!isBuyer && !isSeller) {
      return NextResponse.json({ error: "Forbidden: No access to this delivery" }, { status: 403 });
    }

    const fileKey = (delivery as any).fileKey as string | null | undefined;
    if (!fileKey) {
      return NextResponse.json({ error: "No file associated with this delivery" }, { status: 400 });
    }

    if (!fileKey.startsWith("local/")) {
      return NextResponse.json({ error: "Only local storage is enabled in this environment" }, { status: 400 });
    }

    return NextResponse.json({ url: buildLocalUrl(fileKey) });
  } catch (error) {
    console.error("[POST /api/download] error:", error);
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
