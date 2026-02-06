"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export async function submitReview(formData: FormData): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const jobId = formData.get("job_id") as string | null;
    const revieweeId = formData.get("reviewee_id") as string | null;
    const rating = formData.get("rating") as string | null;
    const comment = formData.get("comment") as string | null;

    if (!jobId?.trim()) {
      return { success: false, error: "Invalid job id" };
    }

    if (!revieweeId?.trim()) {
      return { success: false, error: "Invalid reviewee id" };
    }

    if (!rating?.trim()) {
      return { success: false, error: "Rating is required" };
    }

    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    // Verify job exists and is completed
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id,creator_id,status")
      .eq("id", jobId)
      .maybeSingle();

    if (jobError) {
      return { success: false, error: jobError.message };
    }

    if (!job) {
      return { success: false, error: "Job not found" };
    }

    if (job.status !== "completed") {
      return { success: false, error: "Job is not completed" };
    }

    // Verify current user is the job creator (employer)
    if (job.creator_id !== user.id) {
      return { success: false, error: "Only the employer can review" };
    }

    // Check if review already exists
    const { data: existingReview } = await supabase
      .from("reviews")
      .select("id")
      .eq("job_id", jobId)
      .eq("reviewer_id", user.id)
      .maybeSingle();

    if (existingReview) {
      return { success: false, error: "Review already submitted" };
    }

    // Create review
    const { error: insertError } = await supabase
      .from("reviews")
      .insert({
        job_id: jobId,
        reviewer_id: user.id,
        reviewee_id: revieweeId,
        rating: ratingNum,
        comment: comment?.trim() || null,
      });

    if (insertError) {
      throw new Error(insertError.message);
    }

    revalidatePath(`/dashboard/jobs/${jobId}`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
}