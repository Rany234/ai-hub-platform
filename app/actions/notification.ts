"use server";

import { auth } from "@/auth";

export type NotificationItem = {
  id: string;
  title?: string | null;
  content?: string | null;
  created_at?: string | null;
  is_read?: boolean | null;
};

export async function getNotifications(): Promise<NotificationItem[]> {
  const session = await auth();
  if (!session?.user?.id) return [];

  // 通知模块原先基于 Supabase Realtime/表结构实现。
  // 当前项目已全面移除 Supabase，通知功能暂时降级为空实现，后续将用 Prisma 重做。
  return [];
}

export async function markAsRead(_id: string): Promise<{ success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { success: true };
  return { success: true };
}

export async function markAllAsRead(): Promise<{ success: true }> {
  const session = await auth();
  if (!session?.user?.id) return { success: true };
  return { success: true };
}
