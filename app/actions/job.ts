"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { JobStatus } from "@prisma/client";

// --- 校验 Schema ---
const createJobSchema = z.object({
  title: z.string().min(5, "标题至少5个字，给你的需求起个响亮的名字吧"),
  description: z.string().min(20, "描述至少20个字，详情越清楚，开发者接单越快"),
  budget: z.coerce.number().positive().int("预算必须是正整数"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

/**
 * 适配层：将 Prisma Job 对象转换为前端组件期望的旧版数据结构
 * 解决字段名不一致问题（如 created_at vs createdAt）
 */
function adaptJobForFrontend(job: any) {
  if (!job) return null;
  
  return {
    ...job,
    // 基础字段对齐
    created_at: job.createdAt,
    creator_id: job.creatorId,
    // 用户信息对齐 (兼容 profiles 结构)
    profiles: job.creator ? {
      username: job.creator.name || job.creator.username || "匿名用户",
      avatar_url: job.creator.image || job.creator.avatarUrl,
    } : null,
    // 投标计数对齐
    bid_count: job._count?.bids ?? (job.bids?.length || 0),
    // 状态对齐 (JobCard 期望小写)
    status: job.status.toLowerCase(),
  };
}

/**
 * 1. 获取任务列表 (任务广场)
 */
export async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: { 
        status: JobStatus.OPEN 
      },
      orderBy: { 
        createdAt: "desc" 
      },
      include: {
        creator: {
          select: { 
            id: true, 
            name: true, 
            image: true,
            username: true,
            avatarUrl: true 
          },
        },
        _count: {
          select: { bids: true },
        },
      },
    });

    return jobs.map(adaptJobForFrontend);
  } catch (error) {
    console.error("❌ [getJobs] Prisma error:", error);
    return [];
  }
}

/**
 * 2. 获取任务详情
 */
export async function getJobById(jobId: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        creator: {
          select: { 
            id: true, 
            name: true, 
            image: true,
            username: true,
            avatarUrl: true,
            email: true
          },
        },
        bids: {
          include: {
            bidder: {
              select: { 
                id: true, 
                name: true, 
                image: true,
                username: true,
                avatarUrl: true
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bids: true },
        }
      },
    });

    if (!job) return null;
    return adaptJobForFrontend(job);
  } catch (err) {
    console.error(`💥 [getJobById] Error fetching job ${jobId}:`, err);
    return null;
  }
}

/**
 * 3. 创建任务
 */
export async function createJob(input: CreateJobInput) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const validated = createJobSchema.parse(input);

    const newJob = await prisma.job.create({
      data: {
        title: validated.title,
        description: validated.description,
        budget: validated.budget,
        creatorId: userId,
        status: JobStatus.OPEN,
      },
    });

    revalidatePath("/dashboard/jobs");
    return { success: true, data: newJob };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "创建失败";
    console.error("❌ [createJob] Error:", e);
    return { success: false, error: message };
  }
}

/**
 * 4. 删除任务
 */
export async function deleteJob(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) throw new Error("Unauthorized");

    const job = await prisma.job.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!job) throw new Error("任务不存在");
    if (job.creatorId !== userId) throw new Error("无权操作");

    await prisma.job.delete({
      where: { id },
    });

    revalidatePath("/dashboard/jobs");
    return { success: true };
  } catch (error: any) {
    console.error("❌ [deleteJob] Error:", error);
    throw error;
  }
}

/**
 * 5. 获取当前用户发布的任务
 */
export async function getMyPostedJobs() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const jobs = await prisma.job.findMany({
    where: { creatorId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
          username: true,
          avatarUrl: true,
        },
      },
      _count: { select: { bids: true } },
    },
  });

  return jobs.map(adaptJobForFrontend);
}

/**
 * 6. 获取当前用户的投标记录
 */
export async function getMyBids() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const bids = await prisma.bid.findMany({
    where: { bidderId: userId },
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: { select: { bids: true } },
        },
      },
    },
  });

  return bids.map((b) => ({
    ...b,
    job: b.job ? adaptJobForFrontend(b.job) : null,
  }));
}

/**
 * 7. 获取任务的投标列表 (兼容原接口名)
 */
export async function getBidsByJobId(jobId: string) {
  const job = await getJobById(jobId);
  return job?.bids || [];
}
