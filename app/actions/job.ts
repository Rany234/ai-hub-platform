"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

const createJobSchema = z.object({
  title: z.string().min(5, "标题至少5个字，给你的需求起个响亮的名字吧"),
  description: z.string().min(20, "描述至少20个字，详情越清楚，开发者接单越快"),
  budget: z.coerce.number().positive().int("预算必须是正整数"),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export async function getJobById(id: string) {
  try {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("getJobById failed", { id, message, error });
    throw new Error(`Failed to fetch job: ${message}`);
  }
}

export async function getBidsByJobId(jobId: string) {
  try {
    const supabase = await createSupabaseServerClient();

    if (!jobId?.trim()) {
      throw new Error("Invalid job id");
    }

    const { data, error } = await supabase
      .from("bids")
      .select(
        "id,amount,delivery_time,proposal,created_at,bidder_id,status,profiles:bidder_id(id,full_name,avatar_url,role)"
      )
      .eq("job_id", jobId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("getBidsByJobId failed", { jobId, message, error });
    throw new Error(`Failed to fetch bids: ${message}`);
  }
}

export async function acceptBid(bidId: string): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (!bidId?.trim()) {
      return { success: false, error: "Invalid bid id" };
    }

    // 1) Load bid to ensure it exists and get job_id
    const { data: bid, error: bidError } = await supabase
      .from("bids")
      .select("id,job_id,status")
      .eq("id", bidId)
      .maybeSingle();

    if (bidError) {
      return { success: false, error: bidError.message };
    }

    if (!bid) {
      return { success: false, error: "Bid not found" };
    }

    const jobId = bid.job_id as string | null;
    if (!jobId) {
      return { success: false, error: "Bid has no job" };
    }

    // 2) Verify job exists and belongs to current user
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id,creator_id")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) {
      return { success: false, error: jobError.message };
    }

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    if (job.creator_id !== user.id) {
      return { success: false, error: "Forbidden" };
    }

    // 3) Mark bid accepted
    const { error: acceptError } = await supabase
      .from("bids")
      .update({ status: "accepted" })
      .eq("id", bidId)
      .eq("job_id", jobId);

    if (acceptError) {
      return { success: false, error: acceptError.message };
    }

    // 4) Update job status and (optionally) selected_bid_id
    // Probe whether selected_bid_id exists by attempting update; if column missing, retry without it.
    const jobUpdateWithSelected = await supabase
      .from("jobs")
      .update({ status: "in_progress", selected_bid_id: bidId } as any)
      .eq("id", jobId)
      .eq("creator_id", user.id);

    if (jobUpdateWithSelected.error) {
      const message = jobUpdateWithSelected.error.message ?? "";

      // Postgres undefined_column: SQLSTATE 42703 (Supabase often embeds it in message)
      const looksLikeMissingColumn =
        message.includes("selected_bid_id") &&
        (message.includes("column") || message.includes("42703") || message.toLowerCase().includes("does not exist"));

      if (!looksLikeMissingColumn) {
        return { success: false, error: jobUpdateWithSelected.error.message };
      }

      const { error: jobUpdateError } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", jobId)
        .eq("creator_id", user.id);

      if (jobUpdateError) {
        return { success: false, error: jobUpdateError.message };
      }
    }

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "NEXT_REDIRECT") throw error;

    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
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
