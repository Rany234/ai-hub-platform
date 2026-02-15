"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/utils";
import { ActionResult } from "@/types/actions";
import { createListingSchema } from "./schemas";

// 定义返回的 Listing 类型（包含 creator）
export type ListingWithCreator = any;


export async function createListing(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<ListingWithCreator>> {
  try {
    const rawPackages = formData.get("packages");
    const parsedPackages =
      typeof rawPackages === "string" && rawPackages.length > 0
        ? JSON.parse(rawPackages)
        : undefined;

    let input;
    try {
      input = createListingSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      category: formData.get("mainCategory") || undefined,
      previewUrl: formData.get("previewUrl") || undefined,
      packages: parsedPackages,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return { success: false, error: (e as z.ZodError).issues[0]?.message ?? "参数校验失败" };
    }
    throw e;
  }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const signature = await prisma.manifestoSignature.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!signature) {
      return { success: false, error: "Unauthorized: Please sign the manifesto first." };
    }

    const rawPrice = formData.get("price");
    const price = typeof rawPrice === "string" ? parseFloat(rawPrice) : NaN;

    if (isNaN(price)) {
      return { success: false, error: "请输入有效的价格" };
    }

    try {
      const rawType = formData.get("type");
      const type = rawType === "ASSET" ? "ASSET" : "SERVICE";
      const rawAttachmentUrl = formData.get("attachmentUrl");
      const attachmentUrl = typeof rawAttachmentUrl === "string" && rawAttachmentUrl.length > 0 ? rawAttachmentUrl : null;
      const rawInstantDelivery = formData.get("instantDelivery");
      const instantDelivery = rawInstantDelivery === "true";

      const created = await prisma.listing.create({
        data: {
          creatorId: userId,
          type,
          attachmentUrl,
          instantDelivery,
          title: input.title,
          description: input.description ?? null,
          category: input.category ?? null,
          price: price,
          metadata: {
            sub_category: typeof formData.get("subCategory") === "string" ? formData.get("subCategory") : null,
            packages: input.packages,
          } as any,
          previewUrl: input.previewUrl ?? null,
          status: "active",
        },
        include: { creator: true },
      });

      revalidatePath("/");
      revalidatePath("/dashboard");

      return { success: true, data: serializePrisma(created) };
    } catch (e) {
      console.error("SERVER_ACTION_ERROR:", e);
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  } catch (e) {
    console.error("SERVER_ACTION_ERROR:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function updateListing(
  _prevState: unknown,
  formData: FormData
): Promise<ActionResult<ListingWithCreator>> {
  try {
    const rawPackages = formData.get("packages");
    const parsedPackages =
      typeof rawPackages === "string" && rawPackages.length > 0
        ? JSON.parse(rawPackages)
        : undefined;

    const input = createListingSchema.parse({
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      category: formData.get("mainCategory") || undefined,
      previewUrl: formData.get("previewUrl") || undefined,
      packages: parsedPackages,
    });

    const id = formData.get("id");
    if (typeof id !== "string" || id.length === 0) {
      return { success: false, error: "无效的服务 ID" };
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const signature = await prisma.manifestoSignature.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!signature) {
      return { success: false, error: "Unauthorized: Please sign the manifesto first." };
    }

    try {
      const nextSubCategory = formData.get("subCategory");
      const subCategory = typeof nextSubCategory === "string" ? nextSubCategory : null;
      const rawPrice = formData.get("price");
      let price: number | undefined = undefined;

      if (typeof rawPrice === "string") {
        price = parseFloat(rawPrice);
        if (isNaN(price)) return { success: false, error: "请输入有效的价格" };
      }

      const currentListing = await prisma.listing.findFirst({
        where: { id, creatorId: userId },
        select: { metadata: true },
      });

      if (!currentListing) return { success: false, error: "未找到服务或无权限" };

      const existingMetadata =
        currentListing && typeof currentListing.metadata === "object" && currentListing.metadata !== null
          ? (currentListing.metadata as Record<string, unknown>)
          : {};

      const mergedMetadata = {
        ...existingMetadata,
        sub_category: subCategory,
        packages: input.packages,
      } as any;

      const rawType = formData.get("type");
      const type = rawType === "ASSET" ? "ASSET" : "SERVICE";
      const rawAttachmentUrl = formData.get("attachmentUrl");
      const attachmentUrl = typeof rawAttachmentUrl === "string" && rawAttachmentUrl.length > 0 ? rawAttachmentUrl : null;
      const rawInstantDelivery = formData.get("instantDelivery");
      const instantDelivery = rawInstantDelivery === "true";

      const updated = await prisma.listing.update({
        where: { id: id as string },
        data: {
          type,
          attachmentUrl,
          instantDelivery,
          title: input.title,
          description: input.description ?? null,
          category: input.category ?? null,
          price: price,
          metadata: mergedMetadata,
          previewUrl: input.previewUrl ?? null,
        },
        include: { creator: true },
      });

      revalidatePath("/");
      revalidatePath("/dashboard");
      revalidatePath(`/listings/${id}`);

      return { success: true, data: serializePrisma(updated) };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : String(e) };
    }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function remixListing(originalListingId: string, currentUserId: string): Promise<ActionResult<{ id: string }>> {
  try {
    if (!originalListingId || originalListingId.trim().length === 0) {
      return { success: false, error: "无效的原始资产 ID" };
    }

    if (!currentUserId || currentUserId.trim().length === 0) {
      return { success: false, error: "无效的用户 ID" };
    }

    const originalListing = await prisma.listing.findUnique({
      where: { id: originalListingId },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        category: true,
        metadata: true,
        options: true,
        previewUrl: true,
        coverKey: true,
        attachmentUrl: true,
        instantDelivery: true,
      },
    });

    if (!originalListing) {
      return { success: false, error: "原始资产不存在" };
    }

    if (originalListing.type !== "ASSET") {
      return { success: false, error: "仅支持对数字资产进行 Remix（SERVICE 不可 Remix）" };
    }

    const remixed = await prisma.listing.create({
      data: {
        creatorId: currentUserId,
        parentId: originalListing.id,
        type: "ASSET",
        title: `Remix of ${originalListing.title}`,
        description: originalListing.description,
        category: originalListing.category,
        metadata: originalListing.metadata as any,
        options: originalListing.options as any,
        previewUrl: originalListing.previewUrl,
        coverKey: originalListing.coverKey,
        attachmentUrl: originalListing.attachmentUrl,
        instantDelivery: originalListing.instantDelivery,
        royaltyRate: 0.1,
        isRemix: true,
        status: "draft",
        price: 0,
      },
      select: { id: true },
    });

    revalidatePath("/dashboard/listings");
    revalidatePath("/dashboard/services");

    return { success: true, data: { id: remixed.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Remix 操作发生异常" };
  }
}

export async function deleteListing(id: string): Promise<ActionResult<ListingWithCreator>> {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("未登录");

    const listing = await prisma.listing.findFirst({
      where: { id, creatorId: userId },
    });

    if (!listing) return { success: false, error: "未找到服务或无权限" };

    const deleted = await prisma.listing.delete({
      where: { id },
    });

    revalidatePath("/dashboard/services");
    revalidatePath("/");

    return { success: true, data: serializePrisma(deleted) };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "删除操作发生异常" };
  }
}
