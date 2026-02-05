"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

const createJobSchema = z.object({
  title: z.string().min(5, "标题至少5个字，给你的需求起个响亮的名字吧"),
  description: z.string().min(20, "描述至少20个字，详情越清楚，开发者接单越快"),
  budget: z.coerce.number().gt(0, "预算必须大于 0"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export async function getJobById(id: string) {
  const supabase = await createSupabaseServerClient();

  if (!id?.trim()) {
    throw new Error("Invalid job id");
  }

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id,title,description,budget,status,created_at,creator_id,profiles:creator_id(id,full_name,avatar_url,role)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function deleteJob(id: string) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!id?.trim()) {
    throw new Error("Invalid job id");
  }

  // 验证任务是否属于当前用户
  const { data: job } = await supabase
    .from("jobs")
    .select("creator_id")
    .eq("id", id)
    .maybeSingle();

  if (!job) {
    throw new Error("任务不存在");
  }

  if (job.creator_id !== user.id) {
    throw new Error("无权删除此任务");
  }

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
}

export async function createJob(input: CreateJobInput) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "client") {
    throw new Error("只有雇主可以发布任务");
  }

  const validated = createJobSchema.parse(input);

  const { error } = await supabase
    .from("jobs")
    .insert({
      title: validated.title,
      description: validated.description,
      budget: validated.budget,
      creator_id: user.id,
      status: "open",
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}