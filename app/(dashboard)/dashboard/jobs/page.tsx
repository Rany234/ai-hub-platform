import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { getJobs } from "@/app/actions/job";

import { JobsClient } from "./JobsClient";

export default async function JobMarketplacePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/jobs");
  }

  const jobs = await getJobs();

  return <JobsClient jobs={jobs} userId={session.user.id as string} />;
}
