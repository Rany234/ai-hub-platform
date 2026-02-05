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

export async function createBid(input: CreateBidInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 确保用户身份是开发者
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "freelancer") {
    throw new Error("只有开发者可以提交投标");
  }

  // 验证任务存在且为开放状态
  const { data: job } = await supabase
    .from("jobs")
    .select("id,status,creator_id")
    .eq("id", input.jobId)
    .maybeSingle();

  if (!job) {
    throw new Error("任务不存在");
  }

  if (job.status !== "open") {
    throw new Error("任务已关闭，无法投标");
  }

  if (job.creator_id === user.id) {
    throw new Error("不能投标自己发布的任务");
  }

  // 检查是否已投标
  const { data: existingBid } = await supabase
    .from("bids")
    .select("id")
    .eq("job_id", input.jobId)
    .eq("bidder_id", user.id)
    .maybeSingle();

  if (existingBid) {
    throw new Error("您已投标过该任务");
  }

  const validated = createBidSchema.omit({ jobId: true }).parse(input);

  const { error } = await supabase.from("bids").insert({
    job_id: input.jobId,
    bidder_id: user.id,
    amount: validated.amount,
    delivery_time: validated.deliveryTime,
    proposal: validated.proposal,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/dashboard/jobs/${input.jobId}`);
}