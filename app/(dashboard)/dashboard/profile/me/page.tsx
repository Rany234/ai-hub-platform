import { redirect } from "next/navigation";

import { auth } from "@/auth";

export default async function MyProfileRedirectPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/profile/me");
  }

  redirect(`/dashboard/profile/${session.user.id}`);
}
