import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getJobById } from "@/app/actions/job";
import { JobDetailClient } from "./JobDetailClient";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/jobs");
  }

  const { id } = await params;

  const job = await getJobById(id);
  if (!job) {
    notFound();
  }

  return <JobDetailClient job={job} viewerUserId={session.user.id} />;
}
