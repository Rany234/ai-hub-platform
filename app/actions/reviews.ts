"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function submitReview({
  jobId,
  rating,
  comment,
}: {
  jobId: string;
  rating: number;
  comment?: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "Unauthorized" };
    if (!jobId?.trim()) return { success: false, error: "Invalid job id" };

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id,creator_id,worker_id,status")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) return { success: false, error: jobError.message };
    if (!job) return { success: false, error: "Job not found" };

    if (job.status !== "completed") {
      return { success: false, error: "Job is not completed" };
    }

    const isCreator = job.creator_id === user.id;
    const isWorker = Boolean(job.worker_id && job.worker_id === user.id);

    if (!isCreator && !isWorker) {
      return { success: false, error: "Forbidden" };
    }

    const revieweeId = isCreator ? (job.worker_id as string | null) : (job.creator_id as string);

    if (!revieweeId) {
      return { success: false, error: "Missing reviewee" };
    }

    const { data: existingReview, error: existingError } = await supabase
      .from("reviews")
      .select("id")
      .eq("job_id", jobId)
      .eq("reviewer_id", user.id)
      .maybeSingle();

    if (existingError) return { success: false, error: existingError.message };
    if (existingReview) return { success: false, error: "Review already submitted" };

    const { error: insertError } = await supabase.from("reviews").insert({
      job_id: jobId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      rating: ratingNum,
      comment: comment?.trim() || null,
    });

    if (insertError) return { success: false, error: insertError.message };

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
}

export async function getJobReviews(jobId: string): Promise<
  { id: string; job_id: string; reviewer_id: string; reviewee_id: string; rating: number; comment: string | null; created_at: string }[]
> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id,job_id,reviewer_id,reviewee_id,rating,comment,created_at")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as any) ?? [];
}
