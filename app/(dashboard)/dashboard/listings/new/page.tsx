import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { ListingForm } from "@/features/listings/components/ListingForm";

export default async function NewListingPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectedFrom=/dashboard/listings/new");
  }

  return (
    <div className="p-6">
      <ListingForm />
    </div>
  );
}
