import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/features/auth/supabase/server";
import { ListingForm } from "@/features/listings/components/ListingForm";

function assertString(v: unknown): string {
  if (typeof v !== "string" || v.length === 0) throw new Error("无效的服务 ID");
  return v;
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = assertString(id);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirectedFrom=/dashboard/listings/${listingId}/edit`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", listingId)
    .eq("creator_id", user.id)
    .maybeSingle();

  if (error || !listing) {
    notFound();
  }

  return (
    <div className="p-6 max-w-6xl">
      <ListingForm mode="edit" initialData={(listing as any) ?? null} />
    </div>
  );
}
