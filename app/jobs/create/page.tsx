import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { JobFormClient } from "./JobFormClient";

export default async function CreateJobPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold">发布需求</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        填写以下信息，让创作者更好地了解您的需求。
      </p>

      <div className="mt-6 border rounded-lg p-4">
        <JobFormClient />
      </div>
    </div>
  );
}