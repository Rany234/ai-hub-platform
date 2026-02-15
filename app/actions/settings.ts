"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function updateUserSettings(data: {
  name?: string | null;
  bio?: string | null;
  image?: string | null;
  email?: string | null;
  wechatId?: string | null;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Prisma User 模型当前没有 bio/wechatId 字段（服务市场模式下先不存）
    // 这里先只更新 name/image/email，保证设置页可用且不崩。
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name ?? undefined,
        image: data.image ?? undefined,
        email: data.email ?? undefined,
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : String(e) };
  }
}
