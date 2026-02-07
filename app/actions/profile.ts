"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";

export type UserRole = "client" | "freelancer";

export async function updateUserRole(role: UserRole) {
  if (role !== "client" && role !== "freelancer") {
    throw new Error("Invalid role");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      role,
    })
    .select();

  if (error) {
    console.error("Update role failed:", error);
    throw new Error("Failed to update role");
  }

  revalidatePath("/dashboard", "layout");
  return { success: true } as const;
}

export async function getUserProfile(userId: string): Promise<{
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    title: string | null;
    bio: string | null;
    skills: string[] | null;
  };
  stats: {
    total_jobs: number;
    average_rating: number | null;
  };
  reviews: {
    id: string;
    job_id: string;
    reviewer_id: string;
    reviewee_id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }[];
}> {
  const supabase = await createSupabaseServerClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,full_name,avatar_url,title,bio,skills")
    .eq("id", userId)
    .single();

  if (profileError || !profile) {
    throw new Error(profileError?.message ?? "Profile not found");
  }

  const { count: totalJobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("worker_id", userId)
    .eq("status", "completed");

  if (jobsError) {
    throw new Error(jobsError.message);
  }

  const { data: ratingRows, error: ratingError } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", userId);

  if (ratingError) {
    throw new Error(ratingError.message);
  }

  const ratings = (ratingRows ?? []).map((r: any) => Number(r.rating)).filter((n) => Number.isFinite(n));
  const averageRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null;

  const { data: recentReviews, error: reviewsError } = await supabase
    .from("reviews")
    .select("id,job_id,reviewer_id,reviewee_id,rating,comment,created_at")
    .eq("reviewee_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);

  if (reviewsError) {
    throw new Error(reviewsError.message);
  }

  return {
    profile: {
      id: profile.id,
      full_name: (profile as any).full_name ?? null,
      avatar_url: (profile as any).avatar_url ?? null,
      title: (profile as any).title ?? null,
      bio: (profile as any).bio ?? null,
      skills: (profile as any).skills ?? null,
    },
    stats: {
      total_jobs: totalJobs ?? 0,
      average_rating: averageRating,
    },
    reviews: (recentReviews as any) ?? [],
  };
}

export async function updateProfile(data: {
  title?: string | null;
  bio?: string | null;
  skills?: string[] | null;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        title: data.title ?? null,
        bio: data.bio ?? null,
        skills: data.skills ?? null,
      } as any)
      .eq("id", user.id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath(`/dashboard/profile/${user.id}`);
    revalidatePath(`/dashboard/profile/me`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "未知错误";
    return { success: false, error: message };
  }
}
