import Link from "next/link";
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
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <nav className="flex text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/dashboard/services" className="hover:text-foreground">我的服务</Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">发布新服务</li>
          </ol>
        </nav>
      </div>

      <ListingForm />
    </div>
  );
}
