"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { serializePrisma } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import type { ActionResult } from "@/types/actions";

export type ManifestoSignaturePayload = Prisma.ManifestoSignatureGetPayload<{}>;

export async function signManifesto(signatureHash: string): Promise<ActionResult<ManifestoSignaturePayload>> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    throw new Error("请先登录再签署宣言");
  }

  try {
    const created = await prisma.manifestoSignature.create({
      data: {
        userId,
        signatureHash,
        signedAt: new Date(),
      },
    });

    return { success: true, data: serializePrisma(created) };
  } catch (e) {
    // 唯一约束：@@unique([userId])
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new Error("您已经签署过该宣言了");
    }
    throw e;
  }
}

export async function getSignatureStatus() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { signed: false };

  const data = await prisma.manifestoSignature.findUnique({
    where: { userId },
    select: { id: true },
  });

  return { signed: !!data };
}

export async function getSignatureCount() {
  const count = await prisma.manifestoSignature.count();
  return count;
}
