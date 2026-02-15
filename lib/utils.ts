import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 递归序列化 Prisma 对象，处理 Date 和 Decimal 等 Next.js 无法直接序列化的类型
 */
export function serializePrisma<T>(data: T): any {
  if (data === null || data === undefined) return data;

  if (data instanceof Date) {
    return data.toISOString();
  }

  // 处理 Decimal (Prisma 常用)
  if (typeof data === "object" && (data as any).constructor?.name === "Decimal") {
    return (data as any).toString();
  }

  if (Array.isArray(data)) {
    return data.map((item) => serializePrisma(item));
  }

  if (typeof data === "object") {
    const serialized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        serialized[key] = serializePrisma(data[key]);
      }
    }
    return serialized;
  }

  return data;
}
