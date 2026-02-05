"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

const createBidSchema = z.object({
  amount: z.coerce.number().int().positive("报价必须是正整数"),
  deliveryTime: z.string().min(1, "请选择交付周期"),
  proposal: z.string().min(20, "投标方案至少 20 字"),
});

export type CreateBidInput = z.infer<typeof createBidSchema> & {
  jobId: string;
};

export async function createBid(input: CreateBidInput): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // 确保用户身份是开发者
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    if (profile?.role !== "freelancer") {
      return { success: false, error: "只有开发者可以提交投标" };
    }

    if (!input.jobId || input.jobId === "undefined") {
      return { success: false, error: "无效的任务 ID" };
    }

    const validated = createBidSchema.parse(input);

    const amountNum = Number(validated.amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0 || !Number.isInteger(amountNum)) {
      return { success: false, error: "报价必须是正整数" };
    }

    // 验证任务存在且为开放状态
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id,status,creator_id")
      .eq("id", input.jobId)
      .maybeSingle();

    if (jobError) {
      return { success: false, error: jobError.message };
    }

    if (!job) {
      return { success: false, error: "任务不存在" };
    }

    if (job.status !== "open") {
      return { success: false, error: "任务已关闭，无法投标" };
    }

    if (job.creator_id === user.id) {
      return { success: false, error: "不能投标自己发布的任务" };
    }

    // 检查是否已投标
    const { data: existingBid, error: existingBidError } = await supabase
      .from("bids")
      .select("id")
      .eq("job_id", input.jobId)
      .eq("bidder_id", user.id)
      .maybeSingle();

    if (existingBidError) {
      return { success: false, error: existingBidError.message };
    }

    if (existingBid) {
      return { success: false, error: "您已投标过该任务" };
    }

    const { error } = await supabase.from("bids").insert({
      job_id: input.jobId,
      bidder_id: user.id,
      amount: amountNum,
      delivery_time: validated.deliveryTime,
      proposal: validated.proposal,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath(`/dashboard/jobs/${input.jobId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
}